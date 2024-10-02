import time
import asyncio
from .game import RemoteGameLogic
from .input_output import RemoteGameInput, RemoteGameOutput
from  game.models import GameHistory
from channels.db import database_sync_to_async
from authentication.models import CustomUser
from asgiref.sync import sync_to_async
from .game_vs_friend import VsFriendGame

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
    player_consumers = {} # player_id as the key and the consumer as the value
    active_players = {} # player id as the key for every game
    running_games = {} # game instance as the key and the two users in a list as value
    channel_per_player = {} # channel per player, it is a list of player_id and an associated channel_name
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
        cls.player_consumers[player_id] = consumer
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
        # print("in the _update methode")
        for game, player_ids in cls.running_games.items():
            if game.is_fulfilled() == False : #or game.disconnected()  
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
        RemoteGameOutput.add_callback(game.player_1, game.consumer_1, sendConfig=False)  
        RemoteGameOutput.add_callback(game.player_2, game.consumer_2, sendConfig=False) 
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
        RemoteGameOutput.send(game.winner, data_1)
        data_2 = {'status':'lose'}
        print(f"send loser state {data_2} to {game.loser} ")
        RemoteGameOutput.send(game.loser, data_2)

    @classmethod 
    def _save_finished(cls, game_obj):
        print("in the  _save_finished methode") 
        print(game_obj)
        cls.finished_players.append(game_obj.player_1)
        cls.finished_players.append(game_obj.player_2)
        cls.finished_games.append(game_obj)   
        cls.channel_per_player.clear()
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

    @classmethod
    def add_remote_game(cls, player_id, consumer, game_mode='remote'):
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
            game_obj.pause()
            game_obj.set_game_mode(game_mode)
        else:
            cls.disconnected = False
        if (game_obj.player_1 is None):
            game_obj.player_1 = player_id
            game_obj.consumer_1 = consumer
            game_obj.pause()# just making sure the game is not running
        elif(game_obj.player_2 is None):
            game_obj.player_2 = player_id
            game_obj.consumer_2 = consumer
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
        # channel = cls.channel_per_player.get(player_id)
        if game_obj and game_obj.is_fulfilled() and not game_obj.is_finished() \
            and RemoteGameOutput.is_disconnected(player_id): 
            game_obj.pause()
            game_obj.disconnected = True # and disconnetion class also used here
            game_obj.set_disconnection_timeout_callback(cls.remove, cls, player_id)
            return True 
        return False
    

    @classmethod
    def game_focus(cls, player_id):#add return value
        print("in the game_focus methode")
        game = cls.active_players.get(player_id)
        if game is not None and not RemoteGameOutput.there_is_focus(player_id):
            game.unfocused = player_id
            game.pause()
            game.disconnected = True # and disconnetion class also used here
            game.set_disconnection_timeout_callback(cls.remove, cls, player_id)
        elif game is not None:
            # if game.islaunched and game.consumer_1 and game.consumer_1.is_focused  \
            #     and game.consumer_2 and game.consumer_2.is_focused and not game.finished:  
            game.disconnected = False
            game.play()
        return True
        
        
    
    @classmethod 
    def recieve(cls, player_id, event_dict, consumer):
        print("in the  recieve methode")
        """
        To be called from outside of this class. 
        Dont forget To handle game events using GAME
        as the key for revieved events.
        """
        # print("******** RECIEVE ********", cls.active_players)
        if 'event_type' in event_dict and event_dict['event_type'] == 'FRIEND_GAME_REQUEST':
            cls.handle_friend_game_request(event_dict)
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
            RemoteGameInput.try_create(cls, player_id, event_dict, consumer)  
            return None
        if cls.already_in_game(player_id, event_dict):
            game_obj.disconnected = False
            return
        if game_obj.game_mode == 'remote':
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
        player_1_id = event_dict['player_1_id']
        player_2_id = event_dict['player_2_id']
        player_1_consumer = cls.player_consumers.get(player_1_id)
        player_2_consumer = cls.player_consumers.get(player_2_id)
        if player_1_consumer is not None and player_2_consumer is not None:
            game = VsFriendGame(player_1_id, player_2_id)
            cls.active_games.append(game)

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
           RemoteGameOutput.send(player_id, frame)
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
        player_1_instance = await sync_to_async(CustomUser.objects.get)(id=game_obj.player_1)
        player_2_instance = await sync_to_async(CustomUser.objects.get)(id=game_obj.player_2)

        reason = 'defeat' if not disconnect else 'disconnect'

        # Create GameHistory instance asynchronously
        await database_sync_to_async(GameHistory.objects.create)(
            player_1=player_1_instance,
            player_2=player_2_instance,
            player_1_score=game_obj.left_player.score, 
            player_2_score=game_obj.right_player.score,
            winner_id=game_obj.winner,
            loser_id=game_obj.loser,
            game_type='Remote',
            finish_type=reason
        )

        print("saved successfully\n")
        cls._save_finished(game_obj)  
            