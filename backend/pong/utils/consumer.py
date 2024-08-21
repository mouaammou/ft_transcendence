"""
game modes:
    - remote
    - local

input events:
    - onPress:
        call: game.on_press('left|right', key)
    - onRelease
        call: game.on_release('left|right', key)

output events:
    - left_paddle_pos
    - right_paddle_pos
    - right_player_score
    - left_player_score
    - ball_pos
    - finished
"""

from channels.layers import get_channel_layer
import asyncio
from pong.pong_root import PingPongGame

# i will store a unique value in each jwt token payload each time
# no matter if its the same user its always gonna be unique

# on login remove already existing channels with the unique name
# to avoid any issue
# when user logsout the disconnect method is called

# we should use as channel name: f"channel_name_{user_id}"
# and then call this method on the consumer: send_message(self, event) 
# and then use the key 'game_message' to get the message from event


class LocalGameOutputMiddleware:
    callbacks = {}
    
    @classmethod
    def send(cls, channel_name, frame) -> None:
        data = {'update': frame}
        send_task = cls.callbacks.get(channel_name)
        send_task(data)

    @classmethod
    def add_callback(cls, channel_name, send_callback, game_obj) -> None:
        cls.callbacks[channel_name] = send_callback
        cls.send_config(channel_name, game_obj)
    
    @classmethod
    def send_config(cls, channel_name, game_obj):
        data = {'config': game_obj.get_game_config}
        send_task = cls.callbacks.get(channel_name)
        send_task(data)


class LocalGameInputMiddleware:

    @classmethod
    def recieved_dict_text_data(cls, game_obj, dict_text_data):
        """
        dict_text_data: is the recieved text data as dict. as it is recieved
        """
        if dict_text_data.get('onPress', None) is not None:
            game_obj.on_press('left', dict_text_data.get('onPress').strip())
            game_obj.on_press('right', dict_text_data.get('onPress').strip())
        elif dict_text_data.get('onRelease', None) is not None:
            game_obj.on_release('left', dict_text_data.get('onRelease').strip())
            game_obj.on_release('right', dict_text_data.get('onRelease').strip())


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
    def add(cls, channel_name, send_callback, game_mode='local'):
        """used to run new game instance in the event loop"""
        game_obj = cls.runing.get(channel_name)
        if game_obj is None:
            game_obj = cls.game_class()
            game_obj.set_game_mode(game_mode)
            cls.runing[channel_name] = game_obj
        LocalGameOutputMiddleware.add_callback(channel_name, send_callback, game_obj)
        
    
    @classmethod
    def remove(cls, channel_name):
        cls.runing.pop(channel_name)
    
    @classmethod
    def stop(cls, channel_name):
        game_obj = cls.runing.get(channel_name)
        if game_obj:
            game_obj.pause()
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
