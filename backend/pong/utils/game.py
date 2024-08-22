from pong.pong_root import PingPongGameLogic
from .disconnection import LocalGameDisconnection

class PingPongGame(PingPongGameLogic, LocalGameDisconnection):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)