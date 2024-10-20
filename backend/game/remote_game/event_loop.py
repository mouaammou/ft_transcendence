import time
import asyncio
from .game import RemoteGameLogic
from .input_output import RemoteGameInput, RemoteGameOutput
from  game.models import GameHistory
from channels.db import database_sync_to_async
from authentication.models import CustomUser
from asgiref.sync import async_to_sync, sync_to_async
from .game_vs_friend import VsFriendGame
from .tournament import Tournament
from game.models import TournamentHistory

# i will store a unique value in each jwt token payload each time
# no matter if its the same user its always gonna be unique

# on login remove already existing channels with the unique name
# to avoid any issue
# when user logsout the disconnect method is called

# we should use as channel name: f"player_id_{user_id}"
# and then call this method on the consumer: send_message(self, event) 
# and then use the key 'game_message' to get the message from event


                      #revise this code:
# if (tournament.round.status == 'quarter' or tournament.round.status == 'semi-final') and tournament.round.update_round_results():
#                         tournament.round.start = True
#                         tournament.round.end = False
#                         tournament.round.status = tournament.round.get_next_round()
#                         tournament.round.players = tournament.round.get_winners()
#                         tournament.round.games = []
#                         print(f"number of games in the tournament {len(tournament.games)}")
#                         continue



class EventLoopManager:
    """
    player_ids:
        local: player_id
        remote: # set a class to resolve channel names to a game key
            or use channel name as layer group name
    """ 
    active_tournaments = {} # tournament id as the key for every game
    active_players = {} # player id as the key for every game
    running_games = {} # game instance as the key and the two users in a list as value
    players_in_tournaments = {} # player id as the key and the tournament id as the value
    finished_players = [] # players who fininshed their games
    finished_games = [] # finished games
    _event_loop_task = None
    game_class = RemoteGameLogic

    @classmethod
    def connect(cls, channel, consumer):
        print("in the connect methode")
        player_id = consumer.scope['user'].id
        cls.run_event_loop()
        cls._reconnect(player_id, consumer)
        RemoteGameOutput.add_callback(player_id, consumer)
        # if not cls._reconnect(player_id, consumer):
        #    RemoteGameOutput.add_callback(player_id, consumer)
        # always on connect set send callback
        # because the CREATE event assumes that
        # send calback is already set on connect
        return True
        
             
    @classmethod
    def _reconnect(cls, player_id, consumer):
        print("in the _reconnect methode")  
        # """used to run new game instance in the event loop"""
        game_obj = cls.active_players.get(player_id)
        print(f"----> player id {player_id} in the game {game_obj}")
        if game_obj is None:
            return False 
        print('************ RECONNECT *************')
        RemoteGameOutput.add_callback(player_id, consumer, game_obj=game_obj)
        game_obj.disconnected = False # disconnetion class used here
        game_obj.play() 
        # cls.play(player_id) # i think i dont need this on reconnection
        #      beause reconnection controls only disconnection properties not the stop or play properties
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
        while True:
            # print("updating\n")
            cls._update() 
            # print("cleaning\n")
            await cls._clean()
            await asyncio.sleep(1/60)

    @classmethod
    def _update(cls): 
        for game, _ in (cls.running_games.items()):
            if game.is_fulfilled() == False: #or game.disconnected()  
                continue
            frame :dict = game.update()
            if game.is_finished() and not game.saved : 
                print("game is finished") 
                try:
                    game.saved = True
                    asyncio.create_task(cls.save_history(game))
                    print(f"game saved -----> {game.saved}")   
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
        print('######## you can start #########')
        data_1 = {
                'status' : 'start',
                'opponent' : game.player_2 ,
                'side' : 'left'
            }
        data_2 = {
                'status' : 'start',
                'opponent' : game.player_1,
                'side' : 'right'
            }
        RemoteGameOutput._send_to_consumer_group(game.player_1, data_1)
        RemoteGameOutput._send_to_consumer_group(game.player_2, data_2)
       


    @classmethod
    def pause(cls, game):  
        print("in the pause methode")
        game.pause()
 

    @classmethod
    def determine_winner(cls, game):
        print("in the determine winner methode ")
        game.determine_winner_loser()
        data_1 = {'status':'win'}
        print(f"send winner state {data_1} to {game.winner} ")
        RemoteGameOutput.send_update(game.winner, data_1)
        data_2 = {'status':'lose'}
        print(f"send loser state {data_2} to {game.loser} ")
        RemoteGameOutput.send_update(game.loser, data_2)

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
    async def _tournament_clean(cls, game):
        for _, tournament in cls.active_tournaments.items():
            if game in tournament.games:
                index_of_game = tournament.games.index(game)
                if tournament.round.status == 'quarter':
                    if index_of_game == 0:
                        tournament.players[8] = game.winner
                    elif index_of_game == 1:
                        tournament.players[9] = game.winner
                    elif index_of_game == 2:
                        tournament.players[10] = game.winner
                    elif index_of_game == 3:
                        tournament.players[11] = game.winner
                    print(f"index of game sdfg {index_of_game}")
                elif tournament.round.status == 'semi-final':
                    print(f"index of game sdfg {index_of_game}")
                    if index_of_game == 0:
                        tournament.players[12] = game.winner
                    elif index_of_game == 1:
                        tournament.players[13] = game.winner
                elif tournament.round.status == 'final':
                    tournament.players[14] = game.winner
                    tournament.winner = game.winner
                print(f"i stopped here 1")
                # Collect games to be removed
                tournament.finished_games.append(game)
                print(f"i stopped here 2")
                # Remove games after iteration
            #print the result of torunament.round.update_round_results()
            print(f"tournament.round.update_round_results()")
            iisfinished = tournament.round.update_round_results(game)
            print(f"tournament.round.update_round_results() {iisfinished}")
            if iisfinished:
                for game_to_remove in tournament.finished_games:
                    tournament.games.remove(game_to_remove)
                print(f" number of games in the tournament {len(tournament.games)}")
                print(f"round in tournament is finished s--> {tournament.id}")
                tournament.start_new_round()
                print("new round started now sleeping ...")
                await asyncio.sleep(30)
                print("sleeping ends")
                cls.active_tournaments[tournament.id] = tournament
                cls.start_tournament(tournament.organizer)
    
    @classmethod
    async def  _clean(cls):
        # print("in the _clean methode")
        # print(f"im in clean func \n")
        for player_id in cls.finished_players:
            print(f"A PLAYER CLEANED --> {player_id}")
            cls.active_players.pop(player_id)
        for game in cls.finished_games: 
            print(f"A GAME CLEANED ")
            cls.running_games.pop(game)
            await cls._tournament_clean(game)
        cls.finished_players.clear()
        cls.finished_games.clear()


    @classmethod
    def add_random_game(cls, player_id, game_mode='remote'):
        print("in the add methode")
        """
        This method is handled by input middlware.
        so when create event is recieved it uses it
        to add new game instance to the event loop.

        To avoid any issue if multiple CREATE events
        is sent. we handle it like an ATOMIC OPERATION
        """
        print("******** ATOMIC OPERATION ********: add new game")
        # if cls.already_in_game(player_id):
        #     return None
        game_obj = cls.pending_game()
        if  game_obj is None:
            game_obj = cls.game_class()
            game_obj.remote_type = 'random'
            game_obj.pause()# just making sure the game is not running
            game_obj.set_game_mode(game_mode)
        else:
            cls.disconnected = False
        if (game_obj.player_1 is None):
            game_obj.player_1 = player_id
            game_obj.pause()# just making sure the game is not running
        elif(game_obj.player_2 is None):
            game_obj.player_2 = player_id
            game_obj.pause()
        cls.active_players[player_id] = game_obj #waht would happen if i save the game and then add the players.
        cls.unique_game_mapping()
        # else:
        #     game_obj.disconnected = False # disconnetion class used here
        #RemoteGameOutput.add_callback(player_id, send_callback, game_obj)
        
    @classmethod
    def already_in_game(cls, player_id, event_dict):
        print("in the already_in_game methode")
        game = cls.active_players.get(player_id)
        if not game:  # Check if the game exists
            return False
        is_remote = event_dict.get('remote')
        if not is_remote:  # Check if remote data exists
            return False
        is_random = is_remote.get('mode')
        if is_random and game.is_fulfilled() and game.islaunched:# i can check also for the player location, if it is not the '/game', 
            data = {'status': 'already_in_game'}
            RemoteGameOutput._send_to_consumer_group(player_id, data)
            return True
        return False

    def remove(cls, player_id):
        # Retrieve the game associated with the player_id 
        game = cls.active_players.get(player_id)
        if game is not None and not game.saved:
            asyncio.create_task(cls.save_history(game,disconnect=True))
        #now i just have to save the history of this game, the player_id passed to 
        #   remove function is the disconnected player, he lose.

     
    @classmethod
    def stop(cls, player_id):
        print("in the stop methode")
        game_obj = cls.active_players.get(player_id)
        if game_obj:
            game_obj.pause()
            return True
        return False
     

    # used from consumer  
    @classmethod
    def disconnect(cls, player_id):
        print("in the disconnect methode")
        game_obj = cls.active_players.get(player_id)
        if game_obj and game_obj.is_fulfilled() and not game_obj.is_finished() \
            and RemoteGameOutput.is_disconnected(player_id): 
            game_obj.pause()
            game_obj.disconnected = True # and disconnetion class also used here
            game_obj.set_disconnection_timeout_callback(cls.remove, cls, player_id)
            return True 
        return False
    

    @classmethod
    def game_focus(cls, player_id):
        print("in the game_focus methode")
        game = cls.active_players.get(player_id)
        
        if game is None:
            return True

        if not RemoteGameOutput.there_is_focus(player_id) or not RemoteGameOutput.there_is_game_page(player_id):
            cls._handle_unfocused_game(game, player_id)
            return False

        cls._reset_game_focus(game)

        player_id_2 = game.player_1 if game.player_2 == player_id else game.player_2
        if RemoteGameOutput.there_is_focus(player_id_2) and RemoteGameOutput.there_is_game_page(player_id_2):
            cls._resume_game(game)
            return True
        else:
            cls._handle_unfocused_game(game, player_id_2)
            return False

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

# check if the tournament name is contain alphanumric characters
    # @classmethod
    # def check_tournament(cls, player_id, tournament_name):
    #     print("in the check_tournament methode")
    #     if not any(char.isdigit() for char in tournament_name) and any(char.isalpha() for char in tournament_name):
    #         print("tournament name is ac")
    #         RemoteGameOutput._send_to_consumer_group(player_id, {'status': 'is_not_alphanumeric'})
    #         return False
    #     if tournament_name in cls.active_tournaments:
    #         RemoteGameOutput._send_to_consumer_group(player_id, {'status': 'already_exists'})
    #         return False
    #     return True
         
    @classmethod
    def send_tournament_players(cls, player_id):
        tournament_id = cls.players_in_tournaments.get(player_id)
        print(f"tournament id {tournament_id}")
        if tournament_id is not None:
            tournament = cls.active_tournaments.get(tournament_id) 
            if tournament is not None:
                players = tournament.players
                # players = {'round1' : tournament.rounds['quarter'].players if tournament.rounds['quarter'] is not None else None,
                #            'round2' : tournament.rounds['semi-final'].players if tournament.rounds['semi-final'] is not None else None,
                #            'round3' : tournament.rounds['final'].players if tournament.rounds['final'] is not None else None}
                print(f"players in the tournament {players}") 
                RemoteGameOutput.send_tournament_players( tournament.players, {'status': 'players', 'data': players })
            else:
                print(f"No active tournament found with id {tournament_id}")
        else:
            RemoteGameOutput._send_to_consumer_group(player_id, { 'status': 'no_tournament_found'})
            print("Player is not registered in any tournament")


    @classmethod
    def start_tournament(cls, player_id):
        # cls.send_tournament_players(player_id)
        # cls.busy_wait(10)
        tournament_id = cls.players_in_tournaments.get(player_id)
        if tournament_id is not None:
            tournament = cls.active_tournaments.get(tournament_id)
            if tournament is not None and tournament.round is not None:
                print(f"this is the final test enchaalah {tournament.round.status} players {tournament.round.players}")
                for game in tournament.round.games:    
                    cls.running_games[game] = [game.player_1, game.player_2]
                    cls.active_players[game.player_1] = game
                    cls.active_players[game.player_2] = game
                    game.pause()
                    print(f"game {game.player_1} {game.player_2} is created")
                RemoteGameOutput.send_tournament_players(tournament.round.get_players(), {'status': 'PUSH_TO_GAME'})
                

    @classmethod
    def handle_tournament(cls, event_dict, player_id):
        event_type = event_dict.get('type')
        
        if event_type == 'GET_TOURNAMENTS':
            cls.broadcast_tournaments()
            return

        if event_type == 'JOIN_TOURNAMENT': 
            cls.handle_join_tournament(event_dict, player_id)
            return
        
        if event_type == 'START_TOURNAMENT':
            cls.start_tournament(player_id)
            return
        
        if event_type == 'GET_PLAYERS':
            cls.send_tournament_players(player_id)
            return
        data = event_dict.get('data')
        if data is None:
            return 
        tournament_name = data.get('tournament_name')

        if player_id in cls.players_in_tournaments:
            print("player is already in a tournament")
            cls.send_to_consumer_group(player_id, 'already_in_tournament')
        else:
            print("player is not already in a tournament")
            cls.create_tournament(player_id, tournament_name)

    @classmethod
    def broadcast_tournaments(cls):
        print("in the broadcast_tournaments methode")
        tournament_names = []
        for tournament in cls.active_tournaments.values():
            print(f"tournament name {tournament.name}")
            if tournament.status == 'pending':
                tournament_names.append({
                    'id' : tournament.id,
                    'name' : tournament.name,
                    'organizer' : tournament.organizer})
        print(f"tournament names {tournament_names}")
        if tournament_names != []:
            RemoteGameOutput.brodcast({ 'status': 'tournaments_created', 'tournaments': tournament_names })

    @classmethod
    def handle_join_tournament(cls, event_dict, player_id):
        if player_id in cls.players_in_tournaments:
            cls.send_to_consumer_group(player_id, 'already_in_tournament_join')
            return
        data = event_dict.get('data')
        tournament_id = data.get('tournament_id')
        tournament = cls.active_tournaments.get(tournament_id) 
        if tournament is None:
            # print(f"tournament {tournament_id} not found")
            return
        # print(f"player {player_id} joined the tournament 2{tournament_id}")
        if tournament.register_for_tournament(player_id):
            # print(f"player {player_id} joined the tournament 1{tournament_id}")
            cls.players_in_tournaments[player_id] = tournament_id
            cls.send_to_consumer_group(player_id, 'joined_successfully')  
        else:
            # cls.active_tournaments.pop(tournament_name)
            cls.send_to_consumer_group(player_id, 'tournament_full')
        if tournament.fulfilled == True:
            RemoteGameOutput.send_tournament_players(tournament.players, {'status' : 'fulfilled'})
            

    @classmethod
    def create_tournament(cls, player_id, tournament_name):
        tournament = Tournament(player_id, tournament_name)
        print(f"tournament -------)))) >>>>> {tournament.id} created")
        cls.active_tournaments[tournament.id] = tournament
        cls.players_in_tournaments[player_id] = tournament.id
        cls.send_to_consumer_group(player_id, 'created_successfully')  
        cls.broadcast_tournaments()

    @classmethod
    def send_to_consumer_group(cls, player_id, status):
        RemoteGameOutput._send_to_consumer_group(player_id, { 'status': status })
 

    @classmethod
    def send_game_data(cls, player_id):
        print("in the send_game_data methode")
        game_obj = cls.active_players.get(player_id)
        if game_obj:
            print(f"game_obj {game_obj} is fulfilled {game_obj.is_fulfilled()}")
        if game_obj is not None and game_obj.is_fulfilled():
            RemoteGameOutput._send_to_consumer_group(player_id, {'status': 'GAME_DATA', 'player_1': game_obj.player_1, 'player_2': game_obj.player_2, 'game_type': game_obj.remote_type})
        else:
            RemoteGameOutput._send_to_consumer_group(player_id, {'status': 'NO_GAME_DATA'})
    @classmethod 
    def recieve(cls, player_id, event_dict, consumer):
        print("in the  recieve methode")
        """
        To be called from outside of this class. 
        Dont forget To handle game events using GAME
        as the key for revieved events.
        """
        # print("******** RECIEVE ********", cls.active_players)
        if 'type' in event_dict and event_dict['type'] == 'FRIEND_GAME_REQUEST':
            cls.handle_friend_game_request(event_dict)
            return None
        if 'type' in event_dict and event_dict['type'] == 'GET_GAME_DATA':
            cls.send_game_data(player_id)
            return None
        if 'type' in event_dict and (event_dict['type'] == 'CREATE_TOURNAMENT' or event_dict['type'] == 'GET_PLAYERS'
            or event_dict['type'] == 'GET_TOURNAMENTS' or event_dict['type'] == 'JOIN_TOURNAMENT'or event_dict['type'] == 'START_TOURNAMENT') :
            cls.handle_tournament(event_dict, player_id)
            return None
        if not cls.game_focus(player_id):
            return None
        game_obj = cls.active_players.get(player_id)
        if game_obj is None:
            """
            There is no game active_players with that channel name.  
            So check if recieved event is CREATE
            """
            print("create new game instance")
            RemoteGameInput.try_create(cls, player_id, event_dict)  
            return None
        if cls.already_in_game(player_id, event_dict):
            game_obj.disconnected = False
            return
        if game_obj.game_mode == 'remote' and game_obj.unfocused is None:
            cls.handle_remote_game_input(game_obj, player_id, event_dict, consumer)



    # end used
    @classmethod
    def handle_remote_game_input(cls, game_obj, player_id, event_dict, consumer):
        if (game_obj.player_1 == player_id):
            RemoteGameInput.recieved_dict_text_data(game_obj, 'left', event_dict, consumer)
        elif(game_obj.player_2 == player_id):
            RemoteGameInput.recieved_dict_text_data(game_obj, 'right', event_dict, consumer)
                # add middleware for remote game here

 

    @classmethod
    def handle_friend_game_request(cls, event_dict):
        print("in the handle_friend_game_request methode")
        print(f"88888  ------  event_dict {event_dict}")
        player_1_id = event_dict['player_1_id']
        player_2_id = event_dict['player_2_id']
        print(f"player 1 id {player_1_id} player 2 id {player_2_id}")
        if (player_2_id in cls.active_players) or (player_1_id in cls.active_players):
            RemoteGameOutput._send_to_consumer_group(player_1_id, {'status': 'friend_in_game'})
            return None
        game = VsFriendGame(player_1=player_1_id,player_2=player_2_id)
        print(f"game {game.player_1} {game.player_2}")
        cls.running_games[game] = [player_1_id, player_2_id]
        cls.active_players[player_1_id] = game
        cls.active_players[player_2_id] = game
    
    # @classmethod
    # def get_game_obj(cls, player_id):# not used
    #     return cls.active_players.get(player_id)
    
    # @classmethod
    # def is_player_id_already_in_use(cls, player_id): # not used
    #     return bool(cls.active_players.get(player_id))
    
    @classmethod
    def send_frame_to_player(cls, player_id, game_obj, frame):
        # print("in the send_frame_to_player methode")
        if game_obj is None:
            return
        if game_obj.game_mode == 'remote':
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
            if game not in cls.running_games:
                cls.running_games[game] = []  # Initialize a list for new game_ids
                cls.running_games[game].append(player_id)  # Append the player_id
            elif player_id not in cls.running_games[game]:
                cls.running_games[game].append(player_id)
                cls.notify_players(game)  
            

    @classmethod
    async def save_history(cls, game_obj, disconnect=False):
        print("on saving func\n")
        cls.determine_winner(game_obj)
        # Fetch player instances asynchronously
        try:
            player_1_instance = await sync_to_async(CustomUser.objects.get)(id=game_obj.player_1)
            player_2_instance = await sync_to_async(CustomUser.objects.get)(id=game_obj.player_2)
        except CustomUser.DoesNotExist:
            print("A player does not exist.")# this is a problem, because the player should always exist
            print("A player does not exist.")# since i imported the player from the custom user model ---> ask mouad about this
            return

        reason = 'defeat' if not disconnect else 'disconnect'
        if game_obj.remote_type == 'vsfriend':
            l_game_type = 'vs_friend'
        elif game_obj.remote_type == 'random':
            l_game_type = 'random'
        elif game_obj.remote_type == 'tournament':
            l_game_type = 'tournament'
        # Create GameHistory instance asynchronously
        await database_sync_to_async(GameHistory.objects.create)( 
            player_1=player_1_instance,
            player_2=player_2_instance,
            player_1_score=game_obj.left_player.score, 
            player_2_score=game_obj.right_player.score,
            winner_id=game_obj.winner,
            loser_id=game_obj.loser,
            game_type=l_game_type,
            finish_type=reason
        )   

        print("saved successfully\n")
        cls._save_finished(game_obj)  
            