import sys
import time
import asyncio
from .game import RemoteGameLogic
from .input_output import RemoteGameInput, RemoteGameOutput
from game.models import GameHistory
from channels.db import database_sync_to_async
from authentication.models import CustomUser
from asgiref.sync import async_to_sync, sync_to_async
from .game_vs_friend import VsFriendGame
from .tournament import Tournament, TournamentManager
from channels.layers import get_channel_layer
from game.models import TournamentHistory
import logging
from authentication.consumers import NotificationConsumer

# from authentication.consumers import NotificationConsumer
# i will store a unique value in each jwt token payload each time
# no matter if its the same user its always gonna be unique

# on login remove already existing channels with the unique name
# to avoid any issue
# when user logsout the disconnect method is called

# we should use as channel name: f"player_id_{user_id}"
# and then call this method on the consumer: send_message(self, event)
# and then use the key 'game_message' to get the message from event

logger = logging.getLogger(__name__)


class EventLoopManager:
    """
    player_ids:
        local: player_id
        remote: # set a class to resolve channel names to a game key
            or use channel name as layer group name
    """

    active_tournaments = (
        {}
    )  # tournament id as the key and Tournament instance as value for every tournament
    active_players = {}  # player id as the key for every game
    running_games = {}  # game instance as the key and the two users in a list as value
    tournament_games = {}
    players_in_tournaments = (
        {}
    )  # player id as the key and the tournament id as the value
    finished_players = []  # players who fininshed their games
    finished_games = []  # finished games
    _event_loop_task = None
    tournament_task = None
    game_class = RemoteGameLogic

    @classmethod
    def connect(cls, consumer):
        try:
            print(f"in the connect methode --> {consumer.scope['user'].id}")
            player_id = consumer.scope["user"].id
            if player_id is None:
                raise ValueError("User ID is None")
        except AttributeError as e:
            logger.error("Failed to get user ID from consumer: %s", e)
            return False
        except ValueError as e:
            logger.error("Invalid user ID: %s", e)
            return False

        try:
            cls.run_event_loop()
        except Exception as e:
            logger.error("Failed to run event loop: %s", e)
            return False

        try:
            cls._reconnect(player_id, consumer)
        except Exception as e:
            logger.error("Failed to reconnect player %s: %s", player_id, e)
            return False

        try:
            RemoteGameOutput.add_callback(
                player_id, consumer
            )  # i should test this later
        except Exception as e:
            logger.error("Failed to add callback for player %s: %s", player_id, e)
            return False

        return True

    @classmethod
    def _reconnect(cls, player_id, consumer):
        print("in the _reconnect method")
        try:
            game_obj = cls.active_players.get(player_id)
            if game_obj is None:
                logger.error(f"No game object found for player id {player_id}")
                return False
            print(f"----> player id {player_id} in the game {game_obj}")
        except Exception as e:
            logger.error(f"Error retrieving game object for player id {player_id}: {e}")
            return False

        try:
            print("************ RECONNECT *************")
            RemoteGameOutput.add_callback(player_id, consumer)
        except Exception as e:
            logger.error(f"Failed to add callback for player id {player_id}: {e}")
            return False

        try:
            game_obj.disconnected = False
        except Exception as e:
            logger.error(
                f"Failed to set disconnected attribute for player id {player_id}: {e}"
            )
            return False
        return True

    @classmethod
    def run_event_loop(cls) -> None:
        print("in the run_event_loop methode")
        if cls._event_loop_task is not None:
            return
        print("================== EVENT LOOP CREATED ================")
        task = cls._event_loop()
        cls._event_loop_task = asyncio.create_task(task)

    @classmethod
    async def _event_loop(cls):
        print("in the c methode")
        try:
            while True:
                cls._update()
                cls._clean()
                await asyncio.sleep(1 / 60)
        except Exception as e:
            logging.error(f"Error in event loop: {e}")

    @classmethod
    def _update(cls):
        for game, _ in cls.running_games.items():
            if game is None or not game.is_fulfilled():
                continue
            frame: dict = game.update()
            # print(f"game is finished {game.is_finished()} and saved {game.saved}")
            if game.is_finished() and not game.saved:
                # print("game is finished 1")
                try:
                    game.saved = True
                    asyncio.create_task(
                        cls.save_history(game)
                    )  # add the disconnect case here
                except Exception as e:
                    print(f"Error saving game history: {e}")
                print("after save finished game")
                return
            # print(f'game players {game.player_1} {game.player_2}, frame {frame}')
            cls.send_frame_to_player(game.player_1, game, frame)
            cls.send_frame_to_player(game.player_2, game, frame)
            # print("3\n")

    @classmethod
    def notify_players(cls, game):
        print("in the notify_players methode")
        print("######## you can start #########")
        data_1 = {"status": "start", "opponent": game.player_2, "side": "left"}
        data_2 = {"status": "start", "opponent": game.player_1, "side": "right"}
        RemoteGameOutput._send_to_consumer_group(game.player_1, data_1)
        RemoteGameOutput._send_to_consumer_group(game.player_2, data_2)

    @classmethod
    def pause(cls, game):
        print("in the pause methode")
        game.pause()

    @classmethod
    def determine_winner(cls, game):
        print("in the determine winner methode ")
        if game is None:
            return
        game.determine_winner_loser()
        data_1 = {"status": "win"}
        print(f"send winner state {data_1} to {game.winner} ")
        RemoteGameOutput._send_to_consumer_group(game.winner, data_1)
        data_2 = {"status": "lose"}
        print(f"send loser state {data_2} to {game.loser} ")
        RemoteGameOutput._send_to_consumer_group(game.loser, data_2)

    @classmethod
    def _save_finished(cls, game_obj):
        print("in the  _save_finished methode")
        print(game_obj)
        cls.finished_players.append(game_obj.player_1)
        cls.finished_players.append(game_obj.player_2)
        cls.finished_games.append(game_obj)
        # pass

    def busy_wait(seconds):
        start_time = time.time()
        counter = 0
        while time.time() - start_time < seconds:
            # print(f"waiting for players to join {counter}")
            counter += 1
        return counter

    @classmethod
    def _clean(cls):
        # print("in the _clean methode")
        for player_id in cls.finished_players:
            print(f"im in clean func {cls.finished_players}")
            print(f"A PLAYER CLEANED 1 --> {player_id}")
            cls.active_players.pop(player_id)
        for game in cls.finished_games:
            print(f"A GAME CLEANED --> {len(cls.running_games)}")
            cls.running_games.pop(game)
            print(f"A GAME CLEANED --> {len(cls.running_games)}")
        cls.finished_players.clear()
        cls.finished_games.clear()

    @classmethod
    def add_random_game(cls, player_id, game_mode="remote"):
        print("in the add random_game methode")
        """
        This method is handled by input middlware.
        so when create event is recieved it uses it
        to add new game instance to the event loop.

        To avoid any issue if multiple CREATE events
        is sent. we handle it like an ATOMIC OPERATION
        """
        # if cls.already_in_game(player_id):
        #     return None

        game_obj = cls.pending_game()
        if game_obj is None:
            game_obj = cls.game_class()
            game_obj.remote_type = "random"
            game_obj.set_game_mode(game_mode)
        else:
            cls.disconnected = False
        if game_obj.player_1 is None:
            game_obj.player_1 = player_id
        elif game_obj.player_2 is None:
            game_obj.player_2 = player_id
        if game_obj.player_1 == game_obj.player_2:
            game_obj.player_2 = None
            game_obj.fulfilled = False
        game_obj.pause()  # just making sure the game is not running
        cls.active_players[player_id] = game_obj
        cls.unique_game_mapping()

    @classmethod
    def already_in_game(cls, player_id):
        print("in the already_in_game methode of random game")
        if player_id and player_id in cls.active_players:
            game = cls.active_players.get(player_id)
            if game is not None and game.is_fulfilled():
                data = {"status": "already_in_game"}
                print("True in the already_in_game methode")
                RemoteGameOutput._send_to_consumer_group(player_id, data)
                game.disconnected = False
                return True
        if player_id in cls.players_in_tournaments:
            print("YOUR Friend Is already in a game in the add random_game methode")
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "already_in_tournament"}
            )
            return True
        return False

    def remove(cls, player_id):
        # Retrieve the game associated with the player_id
        if player_id and player_id in cls.active_players:
            game = cls.active_players.get(player_id)
            if game is not None:
                game.finished = True

    @classmethod
    def stop(cls, player_id):
        print("in the stop methode")
        game_obj = cls.active_players.get(player_id)
        if game_obj:
            game_obj.pause()
            return True
        return False

    @classmethod
    def disconnect(cls, player_id):
        print("in the disconnect methode")
        if player_id is None:
            return
        game_obj = cls.active_players.get(player_id)
        if (
            game_obj
            and game_obj.is_fulfilled()
            and RemoteGameOutput.is_disconnected(player_id)
        ):
            game_obj.pause()
            game_obj.disconnected = True
            game_obj.set_disconnection_timeout_callback(cls.remove, cls, player_id)
            return True
        return False

    @classmethod
    def game_focus(cls, player_id):
        print("in the game_focus methode")
        game = cls.active_players.get(player_id)

        if game is None or not game.is_fulfilled() or game.finished:
            return True

        if not RemoteGameOutput.there_is_focus(player_id):
            cls._handle_unfocused_game(game, player_id)
            print(f"GAME IS PAUSED {game.finished}")
            return False

        # cls._reset_game_focus(game)

        player_id_2 = game.player_1 if game.player_2 == player_id else game.player_2
        
        if not RemoteGameOutput.there_is_focus(player_id_2):
            cls._handle_unfocused_game(game, player_id_2)
            print(f"GAME IS PAUSED {game.finished}")
            return False
        
        cls._resume_game(game)
        return True

            # cls._handle_unfocused_game(game, player_id_2)
            # print(f"GAME IS PAUSED {game.finished}")
            # return False

    @classmethod
    def _handle_unfocused_game(cls, game, player_id):
        game.unfocused = player_id
        game.pause()
        game.disconnected = True
        game.set_disconnection_timeout_callback(cls.remove, cls, player_id)

    @classmethod
    def _reset_game_focus(cls, game):
        game.unfocused = None
        game.disconnected = False

    @classmethod
    def _resume_game(cls, game):
        game.unfocused = None
        game.disconnected = False
        game.play()

    @classmethod
    def send_tr_players(cls, player_id):
        tournament_id = cls.players_in_tournaments.get(player_id)
        print(f"tournament id {tournament_id}")
        if tournament_id is not None:
            tournament = cls.active_tournaments.get(tournament_id)
            if tournament is not None:
                if tournament.round is not None:
                    players = tournament.round.get_players()
                else:
                    players = tournament.players
                RemoteGameOutput.send_tournament_players(
                    players, {"status": "players", "data": tournament.players}
                )
                if tournament.fulfilled == True and tournament.status == "pending":
                    RemoteGameOutput.send_tournament_players(
                        tournament.players, {"status": "fulfilled"}
                    )
                elif tournament.fulfilled == True and tournament.status != "pending":
                    RemoteGameOutput.send_tournament_players(
                        tournament.players, {"status": "not_fulfilled"}
                    )
                if tournament.winner is not None and tournament.winner == player_id:
                    RemoteGameOutput._send_to_consumer_group(
                        tournament.winner, {"status": "celebration"}
                    )
            else:
                RemoteGameOutput._send_to_consumer_group(
                    player_id, {"status": "no_tournament_found"}
                )
                print(f"No active tournament found with id {tournament_id}")
        else:
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "no_tournament_found"}
            )
            print("Player is not registered in any tournament")

    @classmethod
    def check_players_in_board_page(cls, players):
        print("in the check_players_in_board_page methode")
        for player in players:
            if not RemoteGameOutput.player_in_board_page(player):
                game = cls.active_players.get(player)
                if game is not None:
                    game.pause()
                    game.unfocused = player
                    game.disconnected = True
                    game.set_disconnection_timeout_callback(
                        cls.remove, cls, player
                    )  # i will set timeout to 0 seconds
                    print(f"player {player} is not in the board page")
                else:
                    print(f"player {player} is not in the board page and game is None")
            else:
                print(f"player {player} is in the board page")
        print("end of the check_players_in_board_page methode")

    @classmethod
    async def send_tournament_notifications(cls, players, round, organizer):
        try:
            channel_layer = get_channel_layer()
            logging.info(f"Sending tournament notifications for round: {round}")
            for player in players:
                try:
                    consumer = NotificationConsumer(scope={"user": player})
                    consumer.channel_layer = channel_layer
                    data = {
                        "to_user_id": player,
                        "from_user_id": organizer,
                        "message": f"{round} round starts in 15 seconds. Go to /tournament_board!",
                        "notif_status": "pending",
                    }
                    await consumer.round_notifs(data)
                    logging.info(f"Notification sent to player: {player}")
                except asyncio.TimeoutError:
                    logging.error(f"Timeout sending notification to player: {player}")
                except Exception as e:
                    logging.error(f"Error sending notification to player {player}: {e}")
        except Exception as e:
            logging.error(f"Error sending tournament notifications: {e}")

    @classmethod
    async def send_notifications_to_players(cls, player_id):
        tournament_id = cls.players_in_tournaments.get(player_id)
        if tournament_id:
            tournament = cls.active_tournaments.get(tournament_id)
            if tournament and tournament.round:
                # if tournament.round.status == 'quarter' and tournament.send_once:
                #     return
                # tournament.send_once = True
                players_in_round = tournament.round.get_players()
                if players_in_round:
                    try:
                        await cls.send_tournament_notifications(
                            players_in_round,
                            tournament.round.status,
                            tournament.organizer,   
                        )
                    except Exception as e:
                        print(f"Error sending notifications: {e}")
                    try:
                        await asyncio.sleep(15)
                    except Exception as e:
                        print(f"Error during sleep: {e}")
                    if TournamentManager.check_tournament_is_cancelled(tournament):
                        cls.end_tournament(tournament_id)
                        return
                    TournamentManager.players_in_same_game_left_board_page(tournament)
                    # RemoteGameOutput.send_tournament_players(
                    #     players_in_round, {"status": "PUSH_TO_GAME"}
                    # )
                else:
                    print(
                        f"No players found in the current round of tournament {tournament_id}"
                    )
            else:
                print(
                    f"No active tournament found with id {tournament_id} or tournament round is None"
                )
        else:
            print("Player is not registered in any tournament")

    @classmethod
    def start_tournament(cls, player_id):
        print("in the start_tournament methode")
        if cls.tournament_task is None or cls.tournament_task.done():
            print("******** init the tournament task **********")
            cls.tournament_task = asyncio.create_task(
                cls.run_tournaments_with_exception_handling()
            )

        tournament_id = cls.players_in_tournaments.get(player_id)
        if tournament_id is not None:
            tournament = cls.active_tournaments.get(tournament_id)
            if tournament and tournament.round is not None:
                asyncio.create_task(cls.send_notifications_to_players(player_id))
                tournament.status = "started"
                for game in tournament.round.games:
                    cls.tournament_games[game] = [game.player_1, game.player_2]
                    cls.active_players[game.player_1] = game
                    cls.active_players[game.player_2] = game
                    game.pause()
        #     else:
        #         RemoteGameOutput._send_to_consumer_group(player_id, { 'status': 'no_tournament_found'})
        #         print(f"No active tournament found with id {tournament_id} or tournament round is None ")
        # else:
        #     RemoteGameOutput._send_to_consumer_group(player_id, { 'status': 'no_tournament_found'})
        #     print("Player is not registered in any tournament dfghbdfxg")

    @classmethod
    async def run_tournaments_with_exception_handling(cls):
        try:
            TournamentManager.init(cls)
            await TournamentManager.run_tournaments()
        except Exception as e:
            print(f"Exception in tournament_task: {e}")
            cls.tournament_task = (
                None  # Reset the task so it can be restarted if needed
            )

    @classmethod
    def end_tournament(cls, tournament_id):
        print("in the end_tournament methode")
        tournament = cls.active_tournaments.get(tournament_id)
        if tournament is not None:
            # print(f"ACTIVE PLAYERS BEFORE  {cls.active_players}")
            if tournament.round is not None:
                [
                    cls.active_players.pop(player_id, None)
                    for player_id in tournament.players
                ]
                # print(f"ACTIVE PLAYERS AFTER  {cls.active_players}")
                # print(f"players_in_tournaments BEFORE  {cls.players_in_tournaments}")
                [
                    cls.players_in_tournaments.pop(player_id, None)
                    for player_id in tournament.players
                ]
            # print(f"players_in_tournaments AFTER     {cls.players_in_tournaments}")
            # print(f"tournament games berore {cls.tournament_games}")
            [cls.tournament_games.pop(game, None) for game in tournament.games]
            # print(f"tournament games after {cls.tournament_games}")
            # print(f"tournaments  before {cls.active_tournaments}")
            cls.active_tournaments.pop(tournament_id)
            # print(f"tournaments  after {cls.active_tournaments}")
            # print(f"tournament {tournament_id} is deleted")
        else:
            print(f"No active tournament found with id {tournament_id}")

    @classmethod
    def leave_tournament(cls, player_id):
        tournament_id = cls.players_in_tournaments.get(player_id)
        if tournament_id is not None:
            tournament = cls.active_tournaments.get(tournament_id)
            if tournament is not None:
                if tournament.status != "pending":
                    print("the tournament is already started you can't leave")
                    RemoteGameOutput._send_to_consumer_group(
                        player_id, {"status": "you_can_not_leave"}
                    )
                    return
                if (
                    tournament.organizer == player_id
                    and tournament.claculate_len(tournament.players) > 1
                ):
                    print("the organizer can't leave the tournament")
                    RemoteGameOutput._send_to_consumer_group(
                        player_id, {"status": "organizer_can_not_leave"}
                    )
                    return
                if tournament.remove_player(player_id):
                    cls.players_in_tournaments.pop(player_id)
                    RemoteGameOutput._send_to_consumer_group(
                        player_id, {"status": "left_tournament"}
                    )
                    RemoteGameOutput.send_tournament_players(
                        tournament.players, {"status": "not_fulfilled"}
                    )
                    if tournament.claculate_len(tournament.players) == 0:
                        cls.active_tournaments.pop(tournament_id)
                        cls.broadcast_tournaments()
                        print(f"tournament {tournament_id} is deleted")
                    else:
                        RemoteGameOutput.send_tournament_players(
                            tournament.players,
                            {"status": "players", "data": tournament.players},
                        )
                    tournament.fulfilled = False
                    tournament.status = "pending"
                else:
                    print("Player is not registered in any tournament")
            else:
                print(f"No active tournament found with id {tournament_id}")
        else:
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "no_tournament_found"}
            )

    @classmethod
    def check_player_is_the_winner(cls, player_id):
        print("in the check_player_is_the_winner methode")
        if player_id in cls.players_in_tournaments:
            tournament_id = cls.players_in_tournaments.get(player_id)
            tournament = cls.active_tournaments.get(tournament_id)
            if tournament is not None and tournament.winner == player_id:
                RemoteGameOutput._send_to_consumer_group(
                    tournament.winner, {"status": "celebration"}
                )

    @classmethod
    def recieve(cls, player_id, event_dict):
        print("in the  recieve methode")
        """
        To be called from outside of this class. 
        Dont forget To handle game events using GAME
        as the key for revieved events.
        """
        # print("******** RECIEVE ********", cls.active_players)
        if "type" in event_dict and event_dict["type"] == "FRIEND_GAME_REQUEST":
            cls.handle_friend_game_request(player_id, event_dict)
            return None
        if "type" in event_dict and event_dict["type"] == "GET_GAME_DATA":
            asyncio.create_task(cls.send_game_data(player_id))
            return None
        if "type" in event_dict and (
            event_dict["type"] == "CREATE_TOURNAMENT"
            or event_dict["type"] == "GET_PLAYERS"
            or event_dict["type"] == "LEAVE_TOURNAMENT"
            or event_dict["type"] == "GET_TOURNAMENTS"
            or event_dict["type"] == "JOIN_TOURNAMENT"
            or event_dict["type"] == "START_TOURNAMENT"
        ):
            cls.handle_tournament(event_dict, player_id)
            return None
        if "type" in event_dict and (event_dict["type"] == "RANDOM_GAME"):
            if cls.already_in_game(player_id):
                return None
            cls.add_random_game(player_id, game_mode="remote")
            return None
        if "type" in event_dict and (event_dict["type"] == "LEAVE_RANDOM_PAGE"):
            cls.check_for_game(player_id)
            return None
        game_obj = cls.active_players.get(player_id)
        if game_obj and game_obj.game_mode == "remote":
            cls.handle_remote_game_input(game_obj, player_id, event_dict)
            return None
        # if 'inBoardPage' not in event_dict:
        #     RemoteGameOutput._send_to_consumer_group(player_id, {'status': 'NO_GAME_DATA'})

    @classmethod
    def handle_tournament(cls, event_dict, player_id):
        event_type = event_dict.get("type")

        if event_type == "GET_TOURNAMENTS":
            cls.broadcast_tournaments()
            return

        if event_type == "JOIN_TOURNAMENT":
            cls.handle_join_tournament(event_dict, player_id)
            return

        if event_type == "START_TOURNAMENT":
            tournament_id = cls.players_in_tournaments.get(player_id)
            if tournament_id is not None:
                tournament = cls.active_tournaments.get(tournament_id)
                if tournament and tournament.status == "pending":
                    cls.start_tournament(player_id)
            return

        if event_type == "GET_PLAYERS":
            cls.send_tr_players(player_id)
            return
        if event_type == "LEAVE_TOURNAMENT":
            cls.leave_tournament(player_id)
            return
        data = event_dict.get("data")
        if data is None:
            return
        tournament_name = data.get("tournament_name")

        if cls.already_in_game(player_id):
            print("player is already in a game")
            return
        elif tournament_name is not None:
            print("player is not already in a tournament")
            cls.create_tournament(player_id, tournament_name)

    @classmethod
    def broadcast_tournaments(cls):
        print("in the broadcast_tournaments methode")
        tournament_names = []
        for tournament in cls.active_tournaments.values():
            print(f"tournament name {tournament.name}")
            if not tournament.fulfilled:
                tournament_names.append(
                    {
                        "id": tournament.id,
                        "name": tournament.name,
                        "organizer": tournament.organizer,
                    }
                )
        if tournament_names != []:
            RemoteGameOutput.brodcast(
                {"status": "tournaments_created", "tournaments": tournament_names}
            )
        else:
            RemoteGameOutput.brodcast(
                {"status": "tournaments_created", "tournaments": []}
            )

    @classmethod
    def handle_join_tournament(cls, event_dict, player_id):
        if player_id in cls.players_in_tournaments:
            cls.send_to_consumer_group(player_id, "already_in_tournament_join")
            return
        data = event_dict.get("data")
        if data is None:
            return
        tournament_id = data.get("tournament_id")
        if tournament_id is None:
            return
        tournament = cls.active_tournaments.get(tournament_id)
        if tournament is None:
            print(f"tournament {tournament_id} not found")
            return
        if tournament.register_for_tournament(player_id):
            print(f"player {player_id} joined the tournament 1{tournament_id}")
            cls.players_in_tournaments[player_id] = tournament_id
            cls.send_to_consumer_group(player_id, "joined_successfully")
        else:
            cls.send_to_consumer_group(player_id, "tournament_full")
        if tournament.fulfilled == True:
            RemoteGameOutput.send_tournament_players(
                tournament.players, {"status": "fulfilled"}
            )

    @classmethod
    def create_tournament(cls, player_id, tournament_name):
        tournament = Tournament(player_id, tournament_name)
        print(f"tournament ---->> {tournament_name} created")
        cls.active_tournaments[tournament.id] = tournament
        cls.players_in_tournaments[player_id] = tournament.id
        cls.send_to_consumer_group(player_id, "created_successfully")
        cls.broadcast_tournaments()

    @classmethod
    def send_to_consumer_group(cls, player_id, status):
        RemoteGameOutput._send_to_consumer_group(player_id, {"status": status})

    @classmethod
    async def send_game_data(cls, player_id):
        print("in the send_game_data methode")
        game_obj = cls.active_players.get(player_id)
        if game_obj:
            print(f"game_obj {game_obj} is fulfilled {game_obj.is_fulfilled()}")
        if game_obj and game_obj.is_fulfilled():
            RemoteGameOutput._send_to_consumer_group(
                player_id,
                {
                    "status": "GAME_DATA",
                    "player_1": game_obj.player_1,
                    "player_2": game_obj.player_2,
                    "game_type": game_obj.remote_type,
                    "modal": False,
                },
            )
            game_obj.pause()
            await asyncio.sleep(1)
            if game_obj.unfocused is None:
                RemoteGameOutput.send_config(player_id, game_obj)
                game_obj.play()
                print("game is played")
        else:
            # print("NO GAME DATA because the game is not fulfilled or none")
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "NO_GAME_DATA"}
            )

    @classmethod
    def check_for_game(cls, player_id):
        print("in the check_for_game methode")
        game_obj = cls.active_players.get(player_id)
        if game_obj is not None and game_obj.is_fulfilled():
            return
        # elif game_obj is not None and not game_obj.is_fulfilled():
        cls.active_players.pop(player_id, None)
        cls.running_games.pop(game_obj, None)
        print(f"player {player_id} is removed from the active players")
        return

    # end used
    @classmethod
    def handle_remote_game_input(cls, game_obj, player_id, event_dict):
        if not cls.game_focus(player_id):
            return None
        if game_obj.player_1 == player_id:
            RemoteGameInput.recieved_dict_text_data(game_obj, "left", event_dict)
        elif game_obj.player_2 == player_id:
            RemoteGameInput.recieved_dict_text_data(game_obj, "right", event_dict)
            # add middleware for remote game here

    @classmethod
    def handle_friend_game_request(cls, player_id, event_dict):
        print("in the handle_friend_game_request methode")

        # Validate input
        if "player_1_id" not in event_dict or "player_2_id" not in event_dict:
            print("Error: Missing player IDs in event_dict")
            return None

        player_1_id = event_dict["player_1_id"]
        player_2_id = event_dict["player_2_id"]

        if player_1_id is None or player_2_id is None:
            print("Error: Player IDs cannot be None")
            return None

        if player_1_id == player_2_id:
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "cannot_play_self"}
            )
            return None

        # Check if players are available
        if player_2_id in cls.players_in_tournaments:
            print("Friend already in a tournament")
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "friend_in_tournament"}
            )
            return None

        if player_1_id in cls.players_in_tournaments:
            print("You are already in a tournament")
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "you_in_tournament"}
            )
            return None

        # Check if players are in active games
        if cls.already_in_game(player_1_id):
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "you_in_game"}
            )
            return None

        if player_2_id in cls.active_players:
            game = cls.active_players.get(player_2_id)
            if game is not None and game.is_fulfilled():
                print("Friend already in a game")
                RemoteGameOutput._send_to_consumer_group(
                    player_id, {"status": "friend_in_game"}
                )
                return None

        # Create new game
        try:
            game = VsFriendGame(player_1=player_1_id, player_2=player_2_id)
            cls.running_games[game] = [player_1_id, player_2_id]
            cls.active_players[player_1_id] = game
            cls.active_players[player_2_id] = game
            print(f"Game created between {player_1_id} and {player_2_id}")
            return None
        except Exception as e:
            print(f"Error creating game: {str(e)}")
            RemoteGameOutput._send_to_consumer_group(
                player_id, {"status": "game_creation_failed"}
            )
            return None

    @classmethod
    def send_frame_to_player(cls, player_id, game_obj, frame):
        # print("in the send_frame_to_player methode")
        if game_obj is None or player_id is None:
            return
        if game_obj.game_mode == "remote":
            RemoteGameOutput.send_update(player_id, frame)
            # add middleware for remote game here

    @classmethod
    def pending_game(cls):
        print("in the pending_game methode")
        for player, game in cls.active_players.items():
            if game.is_fulfilled() == False:
                return game
        return None

    @classmethod
    def get_players(cls, game):
        print("in the get_players methode")
        for a_game, players in cls.running_games.items():
            if game is a_game:
                return players

    @classmethod
    def unique_game_mapping(cls):
        print("in the unique_game_mapping methode")
        """ 
        Retrieve a dictionary, mapping each unique game_id to a list of player_ids.
        Returns a dictionary where the key is game_id and the value is a list of 
            player ids that have the same game.
        """
        print(f"-----> {len(cls.running_games)}")
        for player_id, game in cls.active_players.items():
            if player_id in cls.players_in_tournaments:
                continue
            if game and game not in cls.running_games:
                cls.running_games[game] = []  # Initialize a list for new game_ids
                cls.running_games[game].append(player_id)  # Append the player_id
            elif game and player_id not in cls.running_games[game]:
                cls.running_games[game].append(player_id)
                cls.notify_players(game)

    @classmethod
    async def save_history(cls, game_obj, disconnect=False):
        print("on saving func\n")
        cls.determine_winner(game_obj)
        # Fetch player instances asynchronously
        try:
            player_1_instance = await sync_to_async(CustomUser.objects.get)(
                id=game_obj.player_1
            )
            player_2_instance = await sync_to_async(CustomUser.objects.get)(
                id=game_obj.player_2
            )
        except CustomUser.DoesNotExist:
            print(
                "A player does not exist."
            )  # this is a problem, because the player should always exist
            print(
                "A player does not exist."
            )  # since i imported the player from the custom user model ---> ask mouad about this
            return

        reason = "defeat" if game_obj._unfocused == None else "disconnect"
        if game_obj.remote_type == "vsfriend":
            l_game_type = "vs_friend"
        elif game_obj.remote_type == "random":
            l_game_type = "random"
        elif game_obj.remote_type == "tournament":
            l_game_type = "tournament"
        # Create GameHistory instance asynchronously
        await database_sync_to_async(GameHistory.objects.create)(
            player_1=player_1_instance,
            player_2=player_2_instance,
            player_1_score=game_obj.left_player.score,
            player_2_score=game_obj.right_player.score,
            winner_id=game_obj.winner,
            loser_id=game_obj.loser,
            game_type=l_game_type,
            finish_type=reason,
        )

        print("saved successfully\n")

        if game_obj.remote_type != "tournament":
            cls._save_finished(game_obj)
