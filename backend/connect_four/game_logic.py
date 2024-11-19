from .game_output import FourGameOutput
import asyncio
import time

class GameLogic:
    ROWS = 6
    COLUMNS = 7

    def __init__(self, player1_id, player2_id):
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.board = [0] * (self.ROWS * self.COLUMNS)
        self.current_turn = player1_id
        self.winner = None
        self.max_wait_time = 20
        self.timer = self.max_wait_time
        self.last_move_time = time.time()
        self.game_active = True

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
        self.current_turn = self.player2_id if self.current_turn == self.player1_id else self.player1_id
        self.last_move_time = time.time()
        
        # Notify players about turn change
        data = {
            'status': 'TURN_CHANGE',
            'current_turn': self.current_turn
        }
        FourGameOutput._send_to_consumer_group(self.player1_id, data)
        FourGameOutput._send_to_consumer_group(self.player2_id, data)

    def make_move(self, player_id, column):
        if not self.game_active or self.winner:
            return False

        if player_id != self.current_turn:
            data = {'status': 'NOT_YOUR_TURN'}
            FourGameOutput._send_to_consumer_group(player_id, data)
            return False
        print(f"Player {player_id} will make a move")
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
                    # 'your_turn': self.current_turn == player_id,
                }
                FourGameOutput._send_to_consumer_group(self.player1_id, data)
                FourGameOutput._send_to_consumer_group(self.player2_id, data)
                
                self.switch_turn()
                return True

        return False

    def update_winner(self, winner_id):
        self.winner = winner_id
        self.game_active = False
        # Notify players about the winner
        data = {
            'status': 'GAME_OVER',
            'winner': winner_id, 
        }
        FourGameOutput._send_to_consumer_group(self.player1_id, data)
        FourGameOutput._send_to_consumer_group(self.player2_id, data)

    # def check_winner(self, player_id, row, column):
    #     # Check horizontal, vertical, and two diagonal directions
    #     return (self.check_direction(player_id, row, column, 1, 0) or  # Horizontal
    #             self.check_direction(player_id, row, column, 0, 1) or  # Vertical
    #             self.check_direction(player_id, row, column, 1, 1) or  # Diagonal /
    #             self.check_direction(player_id, row, column, 1, -1))   # Diagonal \

    # def check_direction(self, player_id, row, column, delta_row, delta_col):
    #     count = 0
    #     for d in range(-3, 4):
    #         r = row + d * delta_row
    #         c = column + d * delta_col
    #         if 0 <= r < self.ROWS and 0 <= c < self.COLUMNS:
    #             index = r * self.COLUMNS + c
    #             if self.board[index] == player_id:
    #                 count += 1
    #                 if count == 4:
    #                     return True
    #             else:
    #                 count = 0
    #     return False

    # def get_board(self):
    #     return self.board

    # def get_current_turn(self):
    #     return self.current_turn

    # def get_winner(self):
    #     return self.winner

    # def format_board(self):
    #     result = "   " + "   ".join(str(i) for i in range(self.COLUMNS)) + "\n"
    #     result += "  +" + "---+" * self.COLUMNS + "\n"
    #     for row in range(self.ROWS):
    #         result += str(row) + " |"
    #         for col in range(self.COLUMNS):
    #             index = row * self.COLUMNS + col
    #             result += f" {self.board[index]:2} |"
    #         result += "\n  +" + "---+" * self.COLUMNS + "\n"
    #     return result