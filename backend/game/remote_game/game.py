from pong.pong_root import PingPongGameLogic
from game.local_game.disconnection import LocalGameDisconnection 

import uuid

class RemoteGameLogic(PingPongGameLogic, LocalGameDisconnection):
    """
    Use this to create game instances.
    """
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        #i have to add a type of the game : random, vsfriend, vsbot
        self.game_id = str(uuid.uuid4())
        self._unfocused = None  
        # self._islaunched = False    
        self._player_1 = None
        self._player_2 = None
        self.fulfilled = False
        self._notify_players = False
        self._winner = None 
        self._loser = None  
        self._saved = False
        self.joined = 0
        self.remote_type = None # random, vsfriend, tournament


    def increment_joined(self):
        self.joined += 1

    # @property
    # def islaunched(self):
    #     return self._islaunched 

    # @islaunched.setter
    # def islaunched(self, value):
    #     self._islaunched = value

    @property
    def unfocused(self):
        return self._unfocused 

    @unfocused.setter
    def unfocused(self, value):
        self._unfocused = value
    
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
        pass

    @property
    def notify_players(self):
        return self._notify_players
    
    @notify_players.setter
    def notify_players(self, value):
        self._notify_players = value

   
    @property
    def winner(self):
        return self._winner 

    @winner.setter
    def winner(self, value):
        self._winner = value


    @property
    def loser(self):
        return self._loser 

    @loser.setter
    def loser(self, value):
        self._loser = value

    @property
    def saved(self):
        return self._saved 

    @saved.setter
    def saved(self, value):
        self._saved = value

    def determine_winner_loser(self):
        if (self.unfocused is not None):
            print("here is where the winner determined")
            self.loser = self.unfocused
            self.winner = self.player_2 if self.loser == self.player_1 else self.player_1
            return
        if (self.left_player.score > self.right_player.score):
            self.winner = self._player_1
            self.loser = self._player_2
            print(f"winner is --> {self._winner} score: {self.left_player.score} and loser is ---> {self._loser} score: {self.right_player.score}")
        else:
            self.winner = self._player_2
            self.loser = self._player_1
            print(f"winner is --> {self._winner} score: {self.right_player.score} and loser is ---> {self._loser} score: {self.left_player.score}")