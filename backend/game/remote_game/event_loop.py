import asyncio
from .game import RemoteGameLogic
from .input_output import LocalGameInputMiddleware, LocalGameOutputMiddleware

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
    runing = {} # channel name as an id for every game
    finished = []
    _event_loop_task = None
    game_class = RemoteGameLogic

    @classmethod
    async def _event_loop(cls):
        while True:
            cls._update() 
            cls._clean()
            await asyncio.sleep(1/60)

    @classmethod
    def _update(cls):
        print("\n I HAVE TO GO BACK UNTILL I GOT A FRIEND TO PLAY WITH\n")
        for player_id, game in cls.runing.items():
            if game.fulfilled == False:
                return
            frame :dict = game.update()
            if game.is_finished():
                cls.finished.append(player_id)
                cls._save_finished(game)
            cls._dispatch_send_event(player_id, game, frame)

    @classmethod
    def _save_finished(cls, game_obj):
        # finished games here
        # do your things here
        print(game_obj)
        pass
        
    @classmethod
    def _clean(cls):
        for player_id in cls.finished:
            cls.runing.pop(player_id)
        cls.finished.clear()

    @classmethod
    def add(cls, player_id, game_mode='remote'):
        """
        This method is handled by input middlware.
        so when create event is recieved it uses it
        to add new game instance to the event loop.

        To avoid any issue if multiple CREATE events
        is sent. we handle it like an ATOMIC OPERATION
        """
        print("******** ATOMIC OPERATION ********: add new game")
        game_obj = cls.pending_game()
        if game_mode is not None:
            if (game_obj.player_1 is None):
                game_obj.player_1 = player_id
            elif(game_obj.plyaer_2 is None):
                game_obj.plyaer_2 = player_id
            game_obj.set_game_mode(game_mode)
            cls.runing[player_id] = game_obj
        elif game_obj is None:
            game_obj = cls.game_class()
            if (game_obj.player_1 is None):
                game_obj.player_1 = player_id
            elif(game_obj.plyaer_2 is None):
                game_obj.plyaer_2 = player_id
            game_obj.set_game_mode(game_mode)
            cls.runing[player_id] = game_obj
        else:
            print(f"\nYAHOYA\n")
        # else:
        #     game_obj.disconnected = False # disconnetion class used here
        # LocalGameOutputMiddleware.add_callback(player_id, send_callback, game_obj)
        
    
    @classmethod
    def _reconnect(cls, player_id, send_callback):
        # """used to run new game instance in the event loop"""
        game_obj = cls.runing.get(player_id)
        if game_obj is None:
            return False
        print('************ RECONNECT *************')
        LocalGameOutputMiddleware.add_callback(player_id, send_callback, game_obj=game_obj)
        game_obj.disconnected = False # disconnetion class used here
        # cls.play(player_id) # i think i dont need this on reconnection
        #      beause reconnection controls only disconnection properties not the stop or play properties
        return True

    @classmethod
    def remove(cls, player_id):
        cls.runing.pop(player_id)
        try:
            cls.finished.pop(player_id)
        except: pass

    
    @classmethod
    def stop(cls, player_id):
        game_obj = cls.runing.get(player_id)
        if game_obj:
            game_obj.pause()
            return True
        return False
    

    # used from consumer
    @classmethod
    def disconnect(cls, player_id):
        game_obj = cls.runing.get(player_id)
        if game_obj:
            game_obj.disconnected = True # and disconnetion class also used here
            # game_obj.set_disconnection_timeout_callback(cls.remove, player_id)
            return True
        return False
    
    @classmethod
    def connect(cls, player_id, send_game_message):
        cls.run_event_loop()
        if not cls._reconnect(player_id, send_game_message):
            LocalGameOutputMiddleware.add_callback(player_id, send_game_message)
        # always on connect set send callback
        # because the CREATE event assumes that
        # send calback is already set on connect
    
    @classmethod
    def recieve(cls, player_id, event_dict):
        """
        To be called from outside of this class.
        Dont forget To handle game events using GAME
        as the key for revieved events.
        """
        # print("******** RECIEVE ********", cls.runing)
        game_obj = cls.runing.get(player_id)
        if game_obj is None:
            """
            There is no game runing with that channel name.
            So check if recieved event is CREATE
            """
            print(f"\nASDFASDFASDFASDF\n")
            print(f"{player_id}")
            print(f"\nASDFASDFASDFASDF\n")
            LocalGameInputMiddleware.try_create(cls, player_id, event_dict)
            return None
        if game_obj.game_mode == 'remote':
            if (game_obj.player_1 == player_id):
                LocalGameInputMiddleware.recieved_dict_text_data(cls, player_id, 'left', event_dict)
            elif(game_obj.player_2 == player_id):
                LocalGameInputMiddleware.recieved_dict_text_data(cls, player_id, 'right', event_dict)
            else:
                print(f"\nSOMETHING WENT WRONG HERE\n")
            # add middleware for remote game here
    # end used

    @classmethod
    def play(cls, player_id):
        game_obj = cls.runing.get(player_id)
        if game_obj:
            game_obj.play()
            return True
        return False
    
    # @classmethod
    # def get_game_obj(cls, player_id):# not used
    #     return cls.runing.get(player_id)
    
    # @classmethod
    # def is_player_id_already_in_use(cls, player_id): # not used
    #     return bool(cls.runing.get(player_id))
    
    @classmethod
    def _dispatch_send_event(cls, player_id, game_obj, frame):
        if game_obj is None:
            return
        if game_obj.game_mode == 'remote':
            LocalGameOutputMiddleware.send(player_id, frame)
            # add middleware for remote game here
    
    @classmethod
    def run_event_loop(cls) -> None:
        if cls._event_loop_task is not None:
            return
        print("================== EVENT LOOP CREATED ================")
        task = cls._event_loop()
        cls._event_loop_task = asyncio.create_task(task)

    @classmethod
    def pending_game(cls):
        for player_id, game in cls.runing.items():
            if game.fulfilled is False:
                return game
        return None
