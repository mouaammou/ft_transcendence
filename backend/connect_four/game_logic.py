class GameLogic:
    ROWS = 6
    COLUMNS = 7

    def __init__(self, player1_id, player2_id):
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.board = [0] * (self.ROWS * self.COLUMNS)
        self.current_turn = player1_id
        self.winner = None

    def make_move(self, player_id, column):
        if self.winner:
            raise ValueError("Game is already over.") # send this message to the frontend later
        if player_id != self.current_turn:
            raise ValueError("It's not your turn.") # send this message to the frontend later and make the frontend display a message and disable the board
        if column < 0 or column >= self.COLUMNS:
            raise ValueError("Invalid column.") # just in case

        for row in reversed(range(self.ROWS)):
            index = row * self.COLUMNS + column
            if self.board[index] == 0:
                self.board[index] = player_id
                self.current_turn = self.player2_id if self.current_turn == self.player1_id else self.player1_id
                return
        raise ValueError("Column is full.")

    def update_winner(self, winner_id):
        self.winner = winner_id

    def check_winner(self, player_id, row, column):
        # Check horizontal, vertical, and two diagonal directions
        return (self.check_direction(player_id, row, column, 1, 0) or  # Horizontal
                self.check_direction(player_id, row, column, 0, 1) or  # Vertical
                self.check_direction(player_id, row, column, 1, 1) or  # Diagonal /
                self.check_direction(player_id, row, column, 1, -1))   # Diagonal \

    def check_direction(self, player_id, row, column, delta_row, delta_col):
        count = 0
        for d in range(-3, 4):
            r = row + d * delta_row
            c = column + d * delta_col
            if 0 <= r < self.ROWS and 0 <= c < self.COLUMNS:
                index = r * self.COLUMNS + c
                if self.board[index] == player_id:
                    count += 1
                    if count == 4:
                        return True
                else:
                    count = 0
        return False

    def get_board(self):
        return self.board

    def get_current_turn(self):
        return self.current_turn

    def get_winner(self):
        return self.winner

    def format_board(self):
        result = "   " + "   ".join(str(i) for i in range(self.COLUMNS)) + "\n"
        result += "  +" + "---+" * self.COLUMNS + "\n"
        for row in range(self.ROWS):
            result += str(row) + " |"
            for col in range(self.COLUMNS):
                index = row * self.COLUMNS + col
                result += f" {self.board[index]:2} |"
            result += "\n  +" + "---+" * self.COLUMNS + "\n"
        return result