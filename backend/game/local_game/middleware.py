"""
input events:
    - onPress:
        - key: 't' ----> stops the game
        -keys [w, s, arrowUp, arrowDown]
            call: game.on_press('left|right', key)
    - onRelease
        -keys [w, s, arrowUp, arrowDown]
            call: game.on_release('left|right', key)
    - create:
        mode: local # required
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
        """
        game_obj is None on connect, But a game instance on reconnect.
        """
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
        press = dict_text_data.get('onPress')
        release = dict_text_data.get('onRelease')
        if press is not None and press.strip() == 't':
            game_obj.start_game = not game_obj.start_game
            return
        if press is not None:
            game_obj.on_press('left', press.strip())
            game_obj.on_press('right', press.strip())
        elif release is not None:
            game_obj.on_release('left', release.strip())
            game_obj.on_release('right', release.strip())
    
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
