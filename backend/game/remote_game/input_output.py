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

class RemoteGameOutput:
    callbacks = {}
    
    @classmethod
    def send(cls, player_id, frame) -> None:
        data = {'update': frame}
        send_task = cls.callbacks.get(player_id)
        send_task(data)

    @classmethod
    def add_callback(cls, player_id, send_callback, game_obj=None) -> None:
        """
        game_obj is None on connect, But a game instance on reconnect.
        """
        cls.callbacks[player_id] = send_callback # only this line means connect
        if game_obj is not None:
            # this means reconncet
            cls.send_config(player_id, game_obj)
        else:
            cls.send_config(player_id, RemoteGameLogic())

    
    @classmethod
    def send_config(cls, player_id, game_obj):
        data = {'config': game_obj.get_game_config}
        send_task = cls.callbacks.get(player_id)
        send_task(data)


class RemoteGameInput:

    @classmethod
    def recieved_dict_text_data(cls, game_obj, side, dict_text_data):
        """
        dict_text_data: is the recieved text data as dict. as it is recieved
        """
        press = dict_text_data.get('onPress') 
        release = dict_text_data.get('onRelease')
        # if press is not None and press.strip() == 'p':
        #     game_obj.start_game = not game_obj.start_game
        #     return
        # elif press is not None and press.strip() == 'esc':
        #     game_obj.start_game = not game_obj.start_game
        #     return
        print(f"\n{side}\n")
        if press is not None:
            game_obj.on_press(side, press.strip())
            game_obj.on_press(side, press.strip())
        elif release is not None:
            game_obj.on_release(side, release.strip())
            game_obj.on_release(side, release.strip())

    @classmethod
    def try_create(cls, event_loop_cls, player_id, event_dict):
        # data = event_dict.get('create')
        # if data is None :
        #     return
        # mode = data.get('mode')
        # if mode is None or mode != 'remote':
        #     return
        print(f"\nASDFASDFASDFASDF\n")
        print(f"{player_id}")
        print(f"\nASDFASDFASDFASDF\n")
        mode = 'remote'
        event_loop_cls.add(player_id, game_mode=mode)
        event_loop_cls.play(player_id)
