import time
import asyncio
from .game import RemoteGameLogic
from .input_output import RemoteGameInput, RemoteGameOutput
from  game.models import GameHistory
from channels.db import database_sync_to_async
from authentication.models import CustomUser
from asgiref.sync import sync_to_async
from .game_vs_friend import VsFriendGame
from .tournament import Tournament

# i will store a unique value in each jwt token payload each time
# no matter if its the same user its always gonna be unique

# on login remove already existing channels with the unique name
# to avoid any issue
# when user logsout the disconnect method is called

# we should use as channel name: f"player_id_{user_id}"
# and then call this method on the consumer: send_message(self, event) 
# and then use the key 'game_message' to get the message from event

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
    a_number = 0
    flag = True

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
        game_obj.play() 
        print('************ RECONNECT *************')
        RemoteGameOutput.add_callback(player_id, consumer, game_obj=game_obj)
        game_obj.disconnected = False # disconnetion class used here
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
            cls._clean()
            await asyncio.sleep(1/60)

    @classmethod
    def _update(cls):
        # print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^111")
        # if len(cls.active_tournaments) == 0:
        #     print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^222")
        #     player_ids = [11, 12, 13, 14, 15, 16, 17, 18]
        #     print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6661")
        #     tournament = Tournament(player_ids[0])
        #     # asyncio.create_task(time.sleep(1)) # this sleep for 1 second to let the tournament object saved in the database
        #     print(f"the tournament object {tournament}")
        #     cls.active_tournaments[tournament.id] = tournament
        #     print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6663")
        #     for player_id in player_ids[1:]:
        #         print(f"length of active tournaments {len(cls.active_tournaments)}")
        #         tournament.register_for_tournament(player_id)
        #     print(f"length of active tournaments {len(cls.active_tournaments)}")    
        # for _, tournament in cls.active_tournaments.items():
        #     print(f"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^333 {len(tournament.games)}")
        #     for game in tournament.games:
        #         cls.running_games[game] = [game.player_1, game.player_2]
                # print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^444")
                # if game.is_fulfilled() == False: #or game.disconnected()  
                #     continue
                # print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^555") 
                # if not game.notify_players:
                #     cls.notify_players(game)  
                #     #send config
                #     game.notify_players = True
                # frame :dict = game.update()
                # print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^666")
                # if game.is_finished() and not game.saved : 
                #     print("game is finished\n")
                #     # print(f"game saved -----> {game.saved()}")   
                #     try:
                #         game.saved = True
                #         asyncio.create_task(cls.save_history(game))
                #         print(f"game saved -----> {game.saved}")   
                #     except Exception as e:
                #         print(f"Error saving game history: {e}")      
                #     print("after save finished game\n")
                # print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^777")
                # cls.send_frame_to_player(game.player_1, game, frame) 
                # cls.send_frame_to_player(game.player_2, game, frame)


        for game, _ in (cls.running_games.items()):
            if game.is_fulfilled() == False: #or game.disconnected()  
                continue
            if not game.notify_players:
                cls.notify_players(game) 
                #send config
                game.notify_players = True
            frame :dict = game.update()

            if game.is_finished() and not game.saved : 
                print("game is finished\n")
                # print(f"game saved -----> {game.saved()}")   
                try:
                    game.saved = True
                    asyncio.create_task(cls.save_history(game))
                    print(f"game saved -----> {game.saved}")   
                except Exception as e:
                    print(f"Error saving game history: {e}")      
                print("after save finished game\n")
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
        
    @classmethod
    def _clean(cls):
        # print("in the _clean methode")
        # print(f"im in clean func \n")
        for player_id in cls.finished_players:
            print(f"A PLAYER CLEANED --> {player_id}")
            cls.active_players.pop(player_id)
        for game in cls.finished_games: 
            print("A GAME CLEANED")
            cls.running_games.pop(game)  
        cls.finished_players.clear()
        cls.finished_games.clear()
        # print("out of clean func\n")
        # wait(10000000000000000000)
        # print("yaaaawww\n")

    # @classmethod
    # def add_vs_friend_game(cls, player_id, consumer, game_mode='remote'):
    #     print("in the add_vs_friend_game methode")
    #     game = VsFriendGame(player_id, consumer)
    #     cls.running_games.append(game )
        #RemoteGameOutput.add_callback(player_id, send_callback, game_obj)


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
    
    # @classmethod
    # def game_page(cls, player_id):
    #     print("in the in_game_page methode")
    #     game = cls.active_players.get(player_id)
   
    #     if game is not None and not RemoteGameOutput.there_is_game_page(player_id):
    #         print(f"player_id {player_id} is not in the game page")
    #         game.unfocused = player_id
    #         game.pause()
    #         game.disconnected = True
    #         game.set_disconnection_timeout_callback(cls.remove, cls, player_id)
    #         return False
    #     elif game is not None:
    #         player_id_2 = game.player_1 if game.player_2 == player_id else game.player_2
    #         print(f"all players are in the game page, always run the game {player_id}")
    #         if RemoteGameOutput.there_is_game_page(player_id_2) and game.unfocused is None:
    #             game.play()
    #             game.disconnected = False
    #             return True
    #         else:
    #             return False
    #     return True


    @classmethod
    def game_focus(cls, player_id):
        print("in the game_focus methode")
        game = cls.active_players.get(player_id)
        if game is not None and (not RemoteGameOutput.there_is_focus(player_id) or not RemoteGameOutput.there_is_game_page(player_id)):
            game.unfocused = player_id
            game.pause()
            game.disconnected = True 
            game.set_disconnection_timeout_callback(cls.remove, cls, player_id)
            return False
        elif game is not None:
            player_id_2 = game.player_1 if game.player_2 == player_id else game.player_2
            if RemoteGameOutput.there_is_focus(player_id_2) and RemoteGameOutput.there_is_game_page(player_id_2):
                game.unfocused = None
                game.disconnected = False
                game.play()
                return True
        return True

# check if the tournament name is contain alphanumric characters
    @classmethod
    def check_tournament(cls, player_id, tournament_name):
        print("in the check_tournament methode")
        if not any(char.isdigit() for char in tournament_name) and any(char.isalpha() for char in tournament_name):
            print("tournament name is ac")
            RemoteGameOutput._send_to_consumer_group(player_id, {'status': 'is_not_alphanumeric'})
            return False
        if tournament_name in cls.active_tournaments:
            RemoteGameOutput._send_to_consumer_group(player_id, {'status': 'already_exists'})
            return False
        return True
         


    @classmethod
    def handle_tournament(cls, event_dict, player_id):
        event_type = event_dict.get('type')

        if event_type == 'GET_TOURNAMENTS':
            cls.broadcast_tournaments()
            return

        if event_type == 'JOIN_TOURNAMENT': 
            cls.handle_join_tournament(event_dict, player_id)
            return
        if event_type == 'GET_PLAYERS':
            tournament_id = cls.players_in_tournaments.get(player_id)
            print(f"tournament id {tournament_id}")
            if tournament_id is not None:
                tournament = cls.active_tournaments.get(tournament_id)
                players = tournament.players
                print(f"players in the tournament {players}")
                RemoteGameOutput._send_to_consumer_group(player_id, { 'status': 'players', 'data': list(players) })
                return
        data = event_dict.get('data')
        tournament_name = data.get('tournament_name')

        if not cls.check_tournament(player_id, tournament_name):
            return

        if player_id in cls.players_in_tournaments:
            cls.send_to_consumer_group(player_id, 'already_in_tournament')
        else:
            cls.create_tournament(player_id, tournament_name)

    @classmethod
    def broadcast_tournaments(cls):
        tournament_names = list(cls.active_tournaments.keys())
        RemoteGameOutput.brodcast({ 'status': 'tournaments_created', 'tournaments': tournament_names })

    @classmethod
    def handle_join_tournament(cls, event_dict, player_id):
        if player_id in cls.players_in_tournaments:
            cls.send_to_consumer_group(player_id, 'already_in_tournament_join')
            return

        data = event_dict.get('data')
        tournament_name = data.get('tournament_name')
        tournament = cls.active_tournaments.get(tournament_name)

        if tournament is None:
            return

        if tournament.register_for_tournament(player_id):
            cls.players_in_tournaments[player_id] = tournament_name
            cls.send_to_consumer_group(player_id, 'joined_successfully')
        else:
            cls.active_tournaments.pop(tournament_name)
            cls.send_to_consumer_group(player_id, 'tournament_full')

    @classmethod
    def create_tournament(cls, player_id, tournament_name):
        tournament = Tournament(player_id, tournament_name)
        cls.active_tournaments[tournament.id] = tournament
        cls.players_in_tournaments[player_id] = tournament.id
        cls.send_to_consumer_group(player_id, 'created_successfully')
        cls.broadcast_tournaments()

    @classmethod
    def send_to_consumer_group(cls, player_id, status):
        RemoteGameOutput._send_to_consumer_group(player_id, { 'status': status })
 
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
        if 'type' in event_dict and (event_dict['type'] == 'CREATE_TOURNAMENT' or event_dict['type'] == 'GET_PLAYERS'
            or event_dict['type'] == 'GET_TOURNAMENTS'or event_dict['type'] == 'JOIN_TOURNAMENT') :
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
        player_1_id = event_dict['player_1_id']
        player_2_id = event_dict['player_2_id']
        if (player_2_id in cls.active_players) or (player_1_id in cls.active_players):
            RemoteGameOutput._send_to_consumer_group(player_1_id, {'status': 'friend_in_game'})
            return None
        game = VsFriendGame(player_1=player_1_id,player_2=player_2_id)
        cls.running_games[game] = [player_1_id, player_2_id]
        cls.active_players[player_1_id] = game
        cls.active_players[player_2_id] = game
        game.play()

    @classmethod
    def play(cls, game_obj):#player_id
        print("in the play methode")
        # game_obj = cls.active_players.get(player_id)
        if game_obj.is_is_fulfilled():
            # RemoteGameOutput.add_callback(player_id, )// add methode in the consumer to send what ever you want to the front!!!!
            game_obj.play()
            return True
        return False
    
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
            print("A player does not exist.")
            print("A player does not exist.")
            print("A player does not exist.")
            print("A player does not exist.")
            print("A player does not exist.")
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
            