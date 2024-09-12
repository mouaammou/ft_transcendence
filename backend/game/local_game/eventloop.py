import asyncio
from .game import PingPongGame
from .middleware import LocalGameInputMiddleware, LocalGameOutputMiddleware

# i will store a unique value in each jwt token payload each time
# no matter if its the same user its always gonna be unique

# on login remove already existing channels with the unique name
# to avoid any issue
# when user logsout the disconnect method is called

# we should use as channel name: f"channel_name_{user_id}"
# and then call this method on the consumer: send_message(self, event) 
# and then use the key 'game_message' to get the message from event

class EventLoopManager:
    """
    channel_names:
        local: channel_name
        remote: # set a class to resolve channel names to a game key
            or use channel name as layer group name
    """
    runing = {} # channel name as an id for every game
    finished = []
    _event_loop_task = None
    game_class = PingPongGame

    @classmethod
    async def _event_loop(cls):
        while True:
            cls._update() 
            cls._clean()
            await asyncio.sleep(1/60)

    @classmethod
    def _update(cls):
        for channel_name, game in cls.runing.items():
            frame :dict = game.update()
            if game.is_finished():
                cls.finished.append(channel_name)
                cls._save_finished(game)
            cls._dispatch_send_event(channel_name, game, frame)

    @classmethod
    def _save_finished(cls, game_obj):
        # finished games here
        # do your things here
        print(game_obj)
        pass
        
    @classmethod
    def _clean(cls):
        for channel_name in cls.finished:
            cls.runing.pop(channel_name)
        cls.finished.clear()

    @classmethod
    def add(cls, channel_name, game_mode='local'):
        """
        This method is handled by input middlware.
        so when create event is recieved it uses it
        to add new game instance to the event loop.

        To avoid any issue if multiple CREATE events
        is sent. we handle it like an ATOMIC OPERATION
        """
        print("******** ATOMIC OPERATION ********: add new game")
        game_obj = cls.runing.get(channel_name)
        if game_obj is None:
            game_obj = cls.game_class()
            game_obj.set_game_mode(game_mode)
            cls.runing[channel_name] = game_obj
        else:
            game_obj.disconnected = False # disconnetion class used here
        # LocalGameOutputMiddleware.add_callback(channel_name, send_callback, game_obj)
        
    
    @classmethod
    def _reconnect(cls, channel_name, send_callback):
        # """used to run new game instance in the event loop"""
        game_obj = cls.runing.get(channel_name)
        if game_obj is None:
            return False
        print('************ RECONNECT *************')
        LocalGameOutputMiddleware.add_callback(channel_name, send_callback, game_obj=game_obj)
        game_obj.disconnected = False # disconnetion class used here
        # cls.play(channel_name) # i think i dont need this on reconnection
        #      beause reconnection controls only disconnection properties not the stop or play properties
        return True

    @classmethod
    def remove(cls, channel_name):
        cls.runing.pop(channel_name)
        try:
            cls.finished.pop(channel_name)
        except: pass

    
    @classmethod
    def stop(cls, channel_name):
        game_obj = cls.runing.get(channel_name)
        if game_obj:
            game_obj.pause()
            return True
        return False
    

    # used from consumer
    @classmethod
    def disconnect(cls, channel_name):
        game_obj = cls.runing.get(channel_name)
        if game_obj:
            game_obj.disconnected = True # and disconnetion class also used here
            game_obj.set_disconnection_timeout_callback(cls.remove, channel_name)
            return True
        return False
    
    @classmethod
    def connect(cls, channel_name, send_game_message):
        cls.run_event_loop()
        if not cls._reconnect(channel_name, send_game_message):
            LocalGameOutputMiddleware.add_callback(channel_name, send_game_message)
        # always on connect set send callback
        # because the CREATE event assumes that
        # send calback is already set on connect
    
    @classmethod
    def recieve(cls, channel_name, event_dict):
        """
        To be called from outside of this class.
        Dont forget To handle game events using GAME
        as the key for revieved events.
        """
        # print("******** RECIEVE ********", cls.runing)
        game_obj = cls.runing.get(channel_name)
        if game_obj is None:
            """
            There is no game runing with that channel name.
            So check if recieved event is CREATE
            """
            LocalGameInputMiddleware.try_create(cls, channel_name, event_dict)
            return None
        if game_obj.game_mode == 'local':
            LocalGameInputMiddleware.recieved_dict_text_data(game_obj, event_dict)
            # add middleware for remote game here
    # end used

    @classmethod
    def play(cls, channel_name):
        game_obj = cls.runing.get(channel_name)
        if game_obj:
            game_obj.play()
            return True
        return False
    
    # @classmethod
    # def get_game_obj(cls, channel_name):# not used
    #     return cls.runing.get(channel_name)
    
    # @classmethod
    # def is_channel_name_already_in_use(cls, channel_name): # not used
    #     return bool(cls.runing.get(channel_name))
    
    @classmethod
    def _dispatch_send_event(cls, channel_name, game_obj, frame):
        if game_obj is None:
            return
        if game_obj.game_mode == 'local':
            LocalGameOutputMiddleware.send(channel_name, frame)
            # add middleware for remote game here
    
    @classmethod
    def run_event_loop(cls) -> None:
        if cls._event_loop_task is not None:
            return
        print("================== EVENT LOOP CREATED ================")
        task = cls._event_loop()
        cls._event_loop_task = asyncio.create_task(task)
