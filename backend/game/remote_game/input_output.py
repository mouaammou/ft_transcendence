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

from .game import RemoteGameLogic
import weakref
# from pong.pong_base import Base


class RemoteGameOutput:
    consumer_group = {}
    

    @classmethod
    def add_callback(cls, player_id, consumer, game_obj=None, sendConfig=True) -> None:
        """
        game_obj is None on connect, But a game instance on reconnect.
        """
        if cls.consumer_group.get(player_id) is None:
            cls.consumer_group[player_id] = weakref.WeakSet()
        cls.consumer_group[player_id].add(consumer)
        print(f"call back added for player --> {player_id}")
        if sendConfig:   
            cls.send_config(player_id, game_obj or RemoteGameLogic())

    @classmethod
    def send(cls, player_id, frame) -> None:
        data = {'update': frame}
        cls._send_to_consumer_group(player_id, data) 
    
    @classmethod
    def send_config(cls, player_id, game_obj) -> None:
        data = {'config': game_obj.get_game_config}
        cls._send_to_consumer_group(player_id, data)
    
    @classmethod 
    def _send_to_consumer_group(cls, player_id, data) -> None:
        group = cls.consumer_group.get(player_id)
        if group is None: 
            return
        for consumer in group: 
            consumer.send_game_message(data)
    
    @classmethod
    def is_disconnection(cls, player_id):
        if cls.consumer_group.get(player_id) is None:
            return True
        return len(cls.consumer_group.get(player_id)) <= 1
    
    @classmethod
    def there_is_focus(cls, unique_key):
        group = cls.consumer_group.get(unique_key)
        if group is None: 
            return False
        return any(cons.is_focused for cons in group)


class RemoteGameInput:

    @classmethod
    def recieved_dict_text_data(cls, game_obj, side, dict_text_data):
        """
        dict_text_data: is the recieved text data as dict. as it is recieved
        """
        if dict_text_data is not None:
            press = dict_text_data.get('onPress') 
            release = dict_text_data.get('onRelease') 
            launch = dict_text_data.get('launch')
        if launch is not None:
            RemoteGameOutput.send_config(game_obj.player_1, game_obj)
            RemoteGameOutput.send_config(game_obj.player_2, game_obj)
            game_obj.play()
        # if press is not None and press.strip() == 'p':
        #     game_obj.start_game = not game_obj.start_game
        #     return
        # elif press is not None and press.strip() == 'esc':
        #     game_obj.start_game = not game_obj.start_game
        #     return
        # print(f"\n{side}\n")
        print(f"{side} ----> {dict_text_data}\n")
        if press is not None:
            game_obj.on_press(side, press.strip())
        elif release is not None:
            game_obj.on_release(side, release.strip())

    @classmethod 
    def try_create(cls, event_loop_cls, player_id, event_dict, consumer):
        data = event_dict.get('remote')
        if data:
            print(data.get('mode'))
        if data is None :
            return
        mode = data.get('mode')
        if mode is None or mode != 'random':
            return
        # elif event_loop_cls.already_in_game(player_id):
        #     return
        event_loop_cls.add(player_id, consumer, game_mode='remote')
        # event_loop_cls.play(player_id)  
  