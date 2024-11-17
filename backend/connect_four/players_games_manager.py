from .game_output import FourGameOutput
from .game_logic import GameLogic

class PlayersGamesManager:
    players = {}
    games = {}
    game_class = GameLogic
    waiting_queue = []
    
    @classmethod
    def connect(cls, consumer, player_id):
        FourGameOutput.add_callback(player_id, consumer)
        cls.add_to_waiting_queue(player_id)

    @classmethod
    def disconnect(cls, player_id):
        if player_id in cls.waiting_queue:
            cls.waiting_queue.remove(player_id)
        if player_id not in cls.players:
            game_id = cls.players.pop(player_id)
            if game_id is not None:
                cls.games.pop(game_id)
    
    @classmethod
    def receive(cls, player_id, data):
        game_id = cls.players.get(player_id)
        if game_id is not None:
            if 'type' in data and data['type'] == 'GET_CONNECT_FOUR_DATA':
                game = cls.games[game_id]
                data = {'status': 'GAME_DATA', 'player_1': game.player1_id, 'player_2': game.player2_id}
                FourGameOutput._send_to_consumer_group(player_id, data)
            # game.receive(player_id, data)

    @classmethod
    def add_to_waiting_queue(cls, player_id):
        print(f"Player {player_id} added to the waiting queue")
        cls.waiting_queue.append(player_id)
        if len(cls.waiting_queue) >= 2:
            cls.create_game()
    
    
    @classmethod
    def create_game(cls):
        player1 = cls.waiting_queue.pop(0)
        player2 = cls.waiting_queue.pop(0)
        game_id = f"game_{player1}_{player2}"
        cls.games[game_id] = cls.game_class(player1, player2)
        cls.players[player1] = game_id
        cls.players[player2] = game_id
        FourGameOutput.redirect_to_game_page(player1, player2)
        print(f"Game created between {player1} and {player2}")
    