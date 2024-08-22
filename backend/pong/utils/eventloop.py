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
            cls.runing.pop(channel_name, None)
        cls.finished.clear()

    @classmethod
    def add_or_reconnect(cls, channel_name, send_callback, game_mode='local'):
        """used to run new game instance in the event loop"""
        game_obj = cls.runing.get(channel_name)
        if game_obj is None:
            game_obj = cls.game_class()
            game_obj.set_game_mode(game_mode)
            cls.runing[channel_name] = game_obj
        else:
            game_obj.disconnected = False # disconnetion class used here
        LocalGameOutputMiddleware.add_callback(channel_name, send_callback, game_obj)
        
    
    @classmethod
    def remove(cls, channel_name):
        cls.runing.pop(channel_name)
        cls.finished.pop(channel_name, None)

    
    @classmethod
    def stop(cls, channel_name):
        game_obj = cls.runing.get(channel_name)
        if game_obj:
            game_obj.pause()
            return True
        return False
    
    @classmethod
    def disconnect(cls, channel_name):
        game_obj = cls.runing.get(channel_name)
        if game_obj:
            game_obj.disconnected = True # and disconnetion class also used here
            return True
        return False

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
    def dispatch_recieved_event(cls, channel_name, event_dict):
        """
        To be called from outside of this class.
        """
        game_obj = cls.runing.get(channel_name)
        if game_obj is None:
            return
        if game_obj.game_mode == 'local':
            LocalGameInputMiddleware.recieved_dict_text_data(game_obj, event_dict)
        elif game_obj.game_mode == 'remote':
            pass
            # add middleware for remote game here
    
    @classmethod
    def _dispatch_send_event(cls, channel_name, game_obj, frame):
        if game_obj is None:
            return
        if game_obj.game_mode == 'local':
            LocalGameOutputMiddleware.send(channel_name, frame)
        elif game_obj.game_mode == 'remote':
            pass
            # add middleware for remote game here
    
    @classmethod
    def run_event_loop(cls) -> None:
        if cls._event_loop_task is not None:
            return
        print("================== EVENT LOOP CREATED ================")
        task = cls._event_loop()
        cls._event_loop_task = asyncio.create_task(task)
