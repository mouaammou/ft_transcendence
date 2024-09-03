from pong.pong_root import PingPongGameLogic
from game.remote_game.disconnection import remoteGameDisconnection

class PingPongRemoteGame(PingPongGameLogic):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)