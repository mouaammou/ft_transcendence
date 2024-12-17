from .game_output import FourGameOutput
from .game_logic import GameLogic
import logging
import asyncio

logger = logging.getLogger(__name__)

class PlayersGamesManager:
    players = {}
    games = {}
    game_class = GameLogic
    waiting_queue = []
    
    @classmethod
    def connect(cls, consumer, player_id):
        FourGameOutput.add_callback(player_id, consumer)


    @classmethod
    async def disconnect(cls, player_id):
        try:
            print("in the disconnect method ")
            if player_id in cls.waiting_queue:
                cls.waiting_queue.remove(player_id)
            if player_id in cls.players:
                game_id = cls.players.pop(player_id, None)
                game = cls.games.get(game_id)
                if game is None:
                    return
                winner = game.player1_id if game.player1_id != player_id else game.player2_id
                if game.save_once == False:
                    data1 = {'status': 'DISCONNECTED'}
                    FourGameOutput._send_to_consumer_group(player_id, data1)
                    data2 = {'status': 'WINNER_BY_DISCONNECTION'}
                    FourGameOutput._send_to_consumer_group(winner, data2)
                game.player_disconnected = player_id
                asyncio.create_task(game.save_game(type_finish='disconnect'))
                game.game_active = False
                cls.players.pop(game.player1_id, None)
                cls.players.pop(game.player2_id, None)
                cls.games.pop(game_id, None)
        except Exception as e:
            logger.error(f"Error disconnecting player with ID: {player_id}: {e}")
            raise
        
        
    @classmethod
    def receive(cls, player_id, data):
        print(f"Player {player_id} sent data: {data}")
        if 'type' in data and data['type'] == 'PLAY_RANDOM':
            if player_id not in cls.waiting_queue:
                cls.add_to_waiting_queue(player_id)
        game_id = cls.players.get(player_id)
        if 'type' in data and data['type'] == 'LEAVE_PLAY_RANDOM':
            if player_id in cls.waiting_queue:
                cls.waiting_queue.remove(player_id)
        if game_id is not None:
            if 'type' in data and data['type'] == 'GET_CONNECT_FOUR_DATA':
                game = cls.games[game_id]
                data = {
                    'status': 'GAME_DATA',
                    'player_1': game.player1_id,
                    'player_2': game.player2_id,
                    'your_turn': game.current_turn,
                }
                FourGameOutput._send_to_consumer_group(player_id, data)
            elif 'type' in data and data['type'] == 'WIN':
                player = data['player']
                game = cls.games[game_id]
                if player =='player1':
                    winner = game.player1_id
                else:
                    winner = game.player2_id
                game.update_winner(winner)
            elif 'type' in data and data['type'] == 'MAKE_MOVE':
                print(f"Player {player_id} will make a move manager")
                game_id = cls.players.get(player_id)
                game = cls.games[game_id]
                column = data['column']
                game.make_move(player_id, column)
        else:
            FourGameOutput._send_to_consumer_group(player_id, {'status': 'NO_GAME_FOUND'})

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
        game = cls.game_class(player1, player2)
        cls.games[game_id] = game
        cls.players[player1] = game_id
        cls.players[player2] = game_id
        FourGameOutput.redirect_to_game_page(player1, player2)
        # Start the game timer
        asyncio.create_task(game.start_timer())
        
        # # Send initial game data to both players
        data = {
            'status': 'GAME_DATA',
            'player1_id': player1,
            'player2_id': player2,    
        }
        FourGameOutput._send_to_consumer_group(player1, data)
        FourGameOutput._send_to_consumer_group(player2, data)
    