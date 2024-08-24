"""
game modes:
    - remote
    - local

input events:
    - onPress:
        call: game.on_press('left|right', key)
    - onRelease
        call: game.on_release('left|right', key)
    - create:
        mode: local
        left: pass
        right: pass
        ...

output events:
    - left_paddle_pos
    - right_paddle_pos
    - right_player_score
    - left_player_score
    - ball_pos
    - finished
"""

from pong.pong_base import Base

class LocalGameOutputMiddleware:
    callbacks = {}
    
    @classmethod
    def send(cls, channel_name, frame) -> None:
        data = {'update': frame}
        send_task = cls.callbacks.get(channel_name)
        send_task(data)

    @classmethod
    def add_callback(cls, channel_name, send_callback, game_obj=None) -> None:
        cls.callbacks[channel_name] = send_callback # only this line means connect
        if game_obj is not None:
            # this means reconncet
            cls.send_config(channel_name, game_obj)
        else:
            cls.send_config(channel_name, Base())

    
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
        if dict_text_data.get('onPress') is not None:
            game_obj.on_press('left', dict_text_data.get('onPress').strip())
            game_obj.on_press('right', dict_text_data.get('onPress').strip())
        elif dict_text_data.get('onRelease') is not None:
            game_obj.on_release('left', dict_text_data.get('onRelease').strip())
            game_obj.on_release('right', dict_text_data.get('onRelease').strip())
    
    @classmethod
    def try_create(cls, event_loop_cls, channel_name, event_dict):
        data = event_dict.get('create')
        if data is None :
            return
        mode = data.get('mode')
        if mode is None or mode != 'local':
            return
        event_loop_cls.add(channel_name, game_mode=mode)
        event_loop_cls.play(channel_name)
