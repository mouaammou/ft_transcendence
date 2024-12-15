from pong.pong_root import PingPongGameLogic
from .disconnection import LocalGameDisconnection
from game.models import LocalTournament
import asyncio


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
    def __init__(self, *args, tourn_obj=None, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.tourn_obj = tourn_obj
        self.left_nickname = None
        self.right_nickname = None
        self.title = tourn_obj.title if tourn_obj else None
        self.local_game_type = 'tournament' if tourn_obj else 'regular'
        self.tournament_id = tourn_obj.id if tourn_obj else None
        # self.game_type = game_type
        # self.game_winner = None
        self.first_time = True
        self.next_match()

    def next_match(self):
        if self.tourn_obj is None:
            return
        left, right = self.tourn_obj.get_match_players(self.tourn_obj.match_index)
        self.left_nickname = left
        self.right_nickname = right
    
    def save_match(self, direction):
        if self.tourn_obj is None:
            return
        winner = getattr(self, direction+'_nickname')
        self.tourn_obj.set_match_winner(self.tourn_obj.match_index, winner)
        print('======== Match saved ======')
        asyncio.create_task(self.tourn_obj.asave())
