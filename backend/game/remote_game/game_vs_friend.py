from .game import RemoteGameLogic

class VsFriendGame:
    active_friend_games = {}

    @classmethod
    def create_friend_game(cls, player_1_id, player_2_id):
        game_id = f"friend_game_{player_1_id}_{player_2_id}"
        if game_id in cls.active_friend_games:
            return None  # Game already exists

        game = RemoteGameLogic()  # Assuming you have a Game class
        game.player_1 = player_1_id
        game.player_2 = player_2_id
        
        cls.active_friend_games[game_id] = game
        return game

    @classmethod
    def get_game(cls, game_id):
        return cls.active_friend_games.get(game_id)