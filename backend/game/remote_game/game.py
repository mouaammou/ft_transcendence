from pong.pong_root import PingPongGameLogic
from game.remote_game.disconnection import remoteGameDisconnection

class RemoteGameLogic(PingPongGameLogic):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.game_id = None
        self.player_1 = None
        self.plyaer_2 = None
        self.fulfilled = False
    
    def clean_up(self):
        pass
    def is_fullfiled(self):
        if (self.player_1 is not None) and (self.player_2 is not None):
            self.fulfilled = True
