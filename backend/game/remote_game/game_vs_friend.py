from .game import RemoteGameLogic

class VsFriendGame(RemoteGameLogic):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        player_1_id = kwargs.get('player_1')
        player_2_id = kwargs.get('player_2')
        self.game_id = f"friend_game_{player_1_id}_{player_2_id}"
        self._player_1 = player_1_id
        self._player_2 = player_2_id 
        self.joined = 2
        self.fulfilled = True
        self._notify_players = False
        self.game_mode = 'remote' 
        self.remote_type = 'vsfriend' # vsfriend, tournament

         
