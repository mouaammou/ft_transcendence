from pong.pong_root import PingPongGameLogic
from .disconnection import LocalGameDisconnection


# class Players:
    
#     def __init__(self, *args, **kwargs) -> None:
#         super().__init__(*args, **kwargs)
#         self.left_data = {}
#         self.right_data = {}
#         self.left_nickname = None
#         self.right_nickname = None
#         self.game_type = 'regular' or 'tournament'
#         self.winner = None
    
#     def set_nickname(self, direction, nickname):
#         self.set_directive(direction, 'nickname', nickname)

#     def get_nickname(self, direction):
#         self.get_directive(direction, 'nickanme')
    
#     def get_directive(self, direction, key):
#         if direction == 'left':
#             return self.left_data.get(key)
#         elif direction == 'right':
#             return self.right_data.get(key)
    
#     def set_directive(self, direction, key, value):
#         if direction == 'left':
#             self.left_data[key] = value
#         elif direction == 'right':
#             self.right_data[key] = value


class PingPongGame(PingPongGameLogic, LocalGameDisconnection):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, game_type='regular', left_nickname=None, right_nickname=None, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.left_nickname = left_nickname
        self.right_nickname = right_nickname
        self.game_type = game_type
        self.game_winner = None