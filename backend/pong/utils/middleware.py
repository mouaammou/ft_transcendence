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