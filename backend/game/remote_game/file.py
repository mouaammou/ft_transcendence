from pong.pong_root import PingPongGameLogic
from game.local_game.disconnection import LocalGameDisconnection 

import uuid

class RemoteGameLogic(PingPongGameLogic, LocalGameDisconnection):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.game_id = str(uuid.uuid4())
        #i have to add a type of the game : random, vsfriend, vsbot
        self._player_1 = None
        self._player_2 = None
        self._notify_players = None
        self._consumer_1 = None
        self._consumer_2 = None
        self.fulfilled = False  # Initialize fulfilled status

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
        
    def is_fulfilled(self):
        return self.fulfilled

    def clean_up(self): 
        # Implement cleanup logic if needed
        pass

    @property
    def notify_players(self):
        return self._notify_players
    
    @notify_players.setter
    def notify_players(self, value):
        self._notify_players = value

    @property
    def consumer_1(self):
        return self._consumer_1 

    @consumer_1.setter 
    def consumer_1(self, value):
        self._consumer_1 = value
 
    @property
    def consumer_2(self):
        return self._consumer_2 

    @consumer_2.setter
    def consumer_2(self, value):
        self._consumer_2 = value