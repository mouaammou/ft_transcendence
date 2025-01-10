import random

class PlayerManager:
    def __init__(self):
        self.waiting_players = []
        self.games = {}  # Maps game ID to player pairs

    def add_player(self, player_id):
        if player_id not in self.waiting_players:
            self.waiting_players.append(player_id)
        if len(self.waiting_players) >= 2:
            # Match two players
            player1 = self.waiting_players.pop(0)
            player2 = self.waiting_players.pop(0)
            game_id = f"game_{random.randint(1000, 9999)}"
            self.games[game_id] = (player1, player2)
            return game_id, (player1, player2)
        return None, None