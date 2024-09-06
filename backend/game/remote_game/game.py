from pong.pong_root import PingPongGameLogic
from game.remote_game.disconnection import remoteGameDisconnection
import uuid

class RemoteGameLogic(PingPongGameLogic):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.game_id = str(uuid.uuid4())
        self._player_1 = None
        self._player_2 = None
        self.fulfilled = False
    
    @property
    def player_1(self):
        return self._player_1

    @player_1.setter
    def player_1(self, value):
        self._player_1 = value
        self.update_fulfilled()

    @property
    def player_2(self):
        return self._player_2

    @player_2.setter
    def player_2(self, value):
        self._player_2 = value
        self.update_fulfilled()

    def update_fulfilled(self):
        self.fulfilled = (self._player_1 is not None) and (self._player_2 is not None)

    def clean_up(self):
        pass