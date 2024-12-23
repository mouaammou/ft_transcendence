from .game_output import FourGameOutput
import logging
import asyncio
import time
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from authentication.models import CustomUser
from game.models import GameHistory

logger = logging.getLogger(__name__)


class GameLogic:
    ROWS = 6
    COLUMNS = 7

    def __init__(self, player1_id, player2_id):
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.board = [0] * (self.ROWS * self.COLUMNS)
        self.current_turn = 'red'
        self.winner = None
        self.loser = None
        self.max_wait_time = 20
        self.timer = self.max_wait_time
        self.last_move_time = time.time()
        self.game_active = True
        self.save_once = False
        self.player_disconnected = -1
        

    async def start_timer(self):
        while self.game_active:
            current_time = time.time()
            # print(f"Current time: {current_time}, Last move time: {self.last_move_time}")
            elapsed = int(current_time - self.last_move_time)
            remaining = max(0, self.max_wait_time - elapsed)
            
            if remaining == 0:
                # Switch turns when timer runs out
                self.switch_turn()
                self.last_move_time = current_time
                
            # Broadcast timer to both players
            data = {
                'status': 'TIMER_UPDATE',
                'time': remaining
            }
            FourGameOutput._send_to_consumer_group(self.player1_id, data)
            FourGameOutput._send_to_consumer_group(self.player2_id, data)
            
            await asyncio.sleep(1)

    def switch_turn(self):
        self.current_turn = 'yellow' if self.current_turn == 'red' else 'red'
        self.last_move_time = time.time()
        
        # Notify players about turn change

        data = {
            'status': 'TURN_CHANGE',
            'current_turn': self.current_turn,
        }
        FourGameOutput._send_to_consumer_group(self.player1_id, data)
        FourGameOutput._send_to_consumer_group(self.player2_id, data)

    def make_move(self, player_id, column):
        if not self.game_active or self.winner:
            return False

        if (player_id == self.player1_id and self.current_turn != 'red') or \
           (player_id == self.player2_id and self.current_turn != 'yellow'):
            data = {'status': 'NOT_YOUR_TURN'}
            FourGameOutput._send_to_consumer_group(player_id, data)
            return False
        if column < 0 or column >= self.COLUMNS:
            return False

        # Find the lowest empty position in the column
        for row in reversed(range(self.ROWS)):
            index = row * self.COLUMNS + column
            if self.board[index] == 0:
                self.board[index] = player_id
                
                # Notify both players about the move
                data = {
                    'status': 'MOVE_MADE',
                    'position': index,
                    'player_id': player_id,
                    'player1_id': self.player1_id,
                }
                FourGameOutput._send_to_consumer_group(self.player1_id, data)
                FourGameOutput._send_to_consumer_group(self.player2_id, data)
                
                self.switch_turn()
                return True
        return False

    def update_winner(self, winner_id):
        self.winner = winner_id
        self.game_active = False
        self.loser = self.player1_id if winner_id == self.player2_id else self.player2_id
        # Notify players about the winner
        data = {
            'status': 'GAME_OVER',
            'winner': self.winner
        }
        FourGameOutput._send_to_consumer_group(self.player1_id, data)
        FourGameOutput._send_to_consumer_group(self.player2_id, data)
        asyncio.create_task(self.save_game())
        
        
    async def save_game(self, type_finish = 'defeat'):
        print("on save game function")
        if self.save_once == True:
            return
        self.save_once = True
        try :
            p_1 = await sync_to_async(CustomUser.objects.get)(id=self.player1_id)
            p_2 = await sync_to_async(CustomUser.objects.get)(id=self.player2_id)
        except CustomUser.DoesNotExist:
            logger.error(f"User does not exist ")
        if self.player_disconnected == -1:  
            score_1 = 1 if self.winner == self.player1_id else 0
            score_2 = 1 if self.winner == self.player2_id else 0
        else:
            score_1 = 0
            score_2 = 0
            self.loser = self.player_disconnected
            self.winner = self.player1_id if self.player_disconnected == self.player2_id else self.player2_id
        try:
            await database_sync_to_async(GameHistory.objects.create)(
                player_1 = p_1,
                player_2 = p_2,
                player_1_score = score_1,
                player_2_score = score_2,
                winner_id = self.winner,
                loser_id = self.loser,
                game_type = 'connect_four',
                finish_type = type_finish
            )
        except Exception as ex:
            logger.error(f"game is not saved {ex}")
            