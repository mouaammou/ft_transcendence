from pong.pong_root import PingPongGameLogic
from .disconnection import LocalGameDisconnection


class Players:
    
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.left = {}
        self.right = {}
        self.game_type = 'regular' or 'tournament'
    
    def set_nickname(self, direction, nickname):
        self.set_directive(direction, 'nickname', nickname)

    def get_nickname(self, direction):
        self.get_directive(direction, 'nickanme')
    
    def get_directive(self, direction, key):
        if direction == 'left':
            return self.left.get(key)
        elif direction == 'right':
            return self.right.get(key)
    
    def set_directive(self, direction, key, value):
        if direction == 'left':
            self.left[key] = value
        elif direction == 'right':
            self.left[key] = value


class PingPongGame(PingPongGameLogic, LocalGameDisconnection, Players):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)