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
    def add_callback(cls, player_id, consumer) -> None:

        """
        game_obj is None on connect, But a game instance on reconnect.
        """
        if cls.consumer_group.get(player_id) is None:
            cls.consumer_group[player_id] = weakref.WeakSet()
        cls.consumer_group[player_id].add(consumer)


    @classmethod
    def send_update(cls, player_id, frame) -> None:

        if player_id is None or frame is None:
            return
        data = {'update': frame}
        cls._send_to_consumer_group(player_id, data) 
    
    @classmethod
    def send_config(cls, player_id, game_obj) -> None:

        data = {'config': game_obj.get_game_config}
        cls._send_to_consumer_group(player_id, data)
    
    @classmethod 
    def _send_to_consumer_group(cls, player_id, data) -> None:
        if player_id is None:
            return
        group = cls.consumer_group.get(player_id)
        if group is None: 
            return
        for consumer in group: 
            consumer.send_game_message(data)
    
    @classmethod
    def is_disconnected(cls, player_id):
        if cls.consumer_group.get(player_id) is None:
            return True

        return len(cls.consumer_group.get(player_id)) <= 1
    

    @classmethod
    def brodcast(cls, data):

        for group in cls.consumer_group.values():
            for consumer in group:
                consumer.send_game_message(data)

    @classmethod
    def send_tournament_players(cls, players, data):

        if players is None or data is None:
            return
        for player_id in players:
            if player_id == -1 or player_id is None:
                continue
            group = cls.consumer_group.get(player_id) 
            if group is None:

                continue
            for consumer in group:
                consumer.send_game_message(data)

    @classmethod
    def there_is_focus(cls, player_id):

        group = cls.consumer_group.get(player_id)
        if group is None: 
            return False
        for consumer in group:
            if consumer.is_focused:
                return True

        return False  
    
    @classmethod
    def player_in_board_page(cls, player_id):
        group = cls.consumer_group.get(player_id)
        if group is None:
            return False
        for consumer in group:
            if consumer.in_board_page is True:
                return True

        return False

class RemoteGameInput:

    @classmethod
    def recieved_dict_text_data(cls, game_obj, side, dict_text_data):

        """
        dict_text_data: is the recieved text data as dict. as it is recieved
        """ 

        if dict_text_data is not None:
            press = dict_text_data.get('onPress') 
            release = dict_text_data.get('onRelease') 

        # if press is not None and press.strip() == 'p':
        #     game_obj.start_game = not game_obj.start_game
        #     return
        # elif press is not None and press.strip() == 'esc':
        #     game_obj.start_game = not game_obj.start_game
        #     return


        if press is not None:
            game_obj.on_press(side, press.strip()) 
        elif release is not None:
            game_obj.on_release(side, release.strip())

    @classmethod 
    def try_create(cls, event_loop_cls, player_id, event_dict):

        data = event_dict.get('remote')
        if data is None :
            return
        mode = data.get('mode')
        if mode is not None and mode == 'random':
            event_loop_cls.add_random_game(player_id, game_mode='remote')
            return
        # elif mode is not None and mode == 'vs_friend':
        #     event_loop_cls.add_vs_friend_game(player_id, consumer, game_mode='remote')
        # elif event_loop_cls.already_in_game(player_id):
        #     return
        # event_loop_cls.play(player_id)  
  