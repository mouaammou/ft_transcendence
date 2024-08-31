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
# from asgiref.sync import async_to_sync
# import asyncio
import weakref

class LocalGameOutputMiddleware:
    consumer_group = {}

    @classmethod
    def add_callback(cls, channel_name, consumer, game_obj=None) -> None:
        """
        game_obj is None on connect, But there is a game instance on reconnect.

        Note: instead of using chained methods to remove consumer from 
            consumer_group every time a socket disconnects. For this i will use
            weak refrence to store consumers.
        """
        if cls.consumer_group.get(channel_name) is None:
            cls.consumer_group[channel_name] = weakref.WeakSet()
        cls.consumer_group[channel_name].add(consumer)
            
        cls.send_config(channel_name, game_obj or Base())

        # print("-"*15)
        # print("consumers: ", len(cls.consumer_group.get(channel_name)))
        # print("-"*15)

    @classmethod
    def send(cls, channel_name, frame) -> None:
        data = {'update': frame}
        cls._send_to_consumer_group(channel_name, data)
    
    @classmethod
    def send_config(cls, channel_name, game_obj) -> None:
        data = {'config': game_obj.get_game_config}
        cls._send_to_consumer_group(channel_name, data)
    
    @classmethod
    def _send_to_consumer_group(cls, channel_name, data) -> None:
        group = cls.consumer_group.get(channel_name)
        if group is None:
            return
        for consumer in group:
                consumer.send_game_message(data)


class LocalGameInputMiddleware:

    @classmethod
    def recieved_dict_text_data(cls, game_obj, dict_text_data):
        """
        dict_text_data: is the recieved text data as dict. as it is recieved
        """
        press = dict_text_data.get('onPress')
        release = dict_text_data.get('onRelease')
        if press is not None and press.strip() == 'p':
            game_obj.start_game = not game_obj.start_game
            return
        elif press is not None and press.strip() == 'esc':
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
        event_loop_cls.add(channel_name)
        event_loop_cls.play(channel_name)
