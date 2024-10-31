try:
    from .pong_base import Base
except:
    from pong_base import Base


class MoveEvents(Base):
    
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        
        self.key_events = {
            'local': {
                'left': {
                    'w': {'type': 'move_up', 'pressed': False},
                    's': {'type': 'move_down', 'pressed': False},
                },
                'right': {
                    'ArrowUp': {'type': 'move_up', 'pressed': False},
                    'ArrowDown': {'type': 'move_down', 'pressed': False},
                }
            },
            'remote': {
                'left': {
                    'w': {'type': 'move_up', 'pressed': False},
                    's': {'type': 'move_down', 'pressed': False},
                    'ArrowUp': {'type': 'move_up', 'pressed': False},
                    'ArrowDown': {'type': 'move_down', 'pressed': False},
                },
                'right': {
                    'w': {'type': 'move_up', 'pressed': False},
                    's': {'type': 'move_down', 'pressed': False},
                    'ArrowUp': {'type': 'move_up', 'pressed': False},
                    'ArrowDown': {'type': 'move_down', 'pressed': False},
                }
            }
        }
    
    def reset_keys_state(self, game_mode: str, player_direction: str):
        assert game_mode in ['local', 'remote'], ValueError
        assert player_direction in ['left', 'right']
        
        keys = self.key_events[game_mode][player_direction]
        for _, value in keys.items():
            value['pressed'] = False
    
    def __get_key(self, game_mode: str, player_direction: str, key: str):
        assert game_mode in ['local', 'remote'], ValueError
        assert player_direction in ['left', 'right']
        
        return self.key_events[game_mode][player_direction].get(key, None)
    
    def on_press(self, game_mode: str, player_direction: str, key:str=None):
        pressed_key = self.__get_key(game_mode, player_direction, key)
        if pressed_key is None:
            return NotImplemented
        pressed_key['pressed'] = True

    def on_release(self, game_mode: str, player_direction: str, key: str):
        pressed_key = self.__get_key(game_mode, player_direction, key)
        if pressed_key is None:
            return NotImplemented
        pressed_key['pressed'] = False
    
    #didnt use it maybe
    def get_key_type(self, game_mode: str, player_direction: str, key: str):
        key = self.__get_key(game_mode, player_direction, key)
        if key is None:
            return None
        return key['type']

    def allow_move_up(self, game_mode: str, player_direction: str):
        assert game_mode in ['local', 'remote'], ValueError
        assert player_direction in ['left', 'right']
        
        keys = self.key_events[game_mode][player_direction]
        for _, value in keys.items():
            if value['type'] == 'move_up' and value['pressed'] is True:
                return True
        return False

    def allow_move_down(self, game_mode: str, player_direction: str):
        assert game_mode in ['local', 'remote'], ValueError
        assert player_direction in ['left', 'right']
        
        keys = self.key_events[game_mode][player_direction]
        for _, value in keys.items():
            if value['type'] == 'move_down' and value['pressed'] is True:
                return True
        return False


class Movements(MoveEvents):
    
    left_padd_top_keys = [82]
    left_padd_bottom_keys = [81]
    
    right_padd_top_keys = [82]
    right_padd_bottom_keys = [81]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def move_ball(self, ball_obj):
        step_x, step_y = ball_obj._step_x, ball_obj._step_y
        x, y = ball_obj.ball_pos
        x += step_x
        y += step_y
        ball_obj.ball_pos = x, y
    
    
    def move_paddles(self, game_mode):
        """call this with direction to make paddles move on the screen"""
        
        if self.allow_move_up(game_mode, 'left'):
            self.on_top_keys_press(self.root_obj.left_player)
        if self.allow_move_down(game_mode, 'left'):
            self.on_bottom_keys_press(self.root_obj.left_player)
        
        if self.allow_move_up(game_mode, 'right'):
            self.on_top_keys_press(self.root_obj.right_player)
        if self.allow_move_down(game_mode, 'right'):
            self.on_bottom_keys_press(self.root_obj.right_player)
        # print('test') AI
        # padd_pos = self.root_obj.left_player.padd_pos
        # ball_pos = self.root_obj.ball.ball_pos
        # self.root_obj.left_player.padd_pos = padd_pos[0], ball_pos[1]
        # padd_pos = self.root_obj.right_player.padd_pos
        # self.root_obj.right_player.padd_pos = padd_pos[0], ball_pos[1]
    
    
    def on_top_keys_press(self, padd_obj):
        # print('TTTop')
        x, y = padd_obj.padd_pos
        new_y = y + self.paddle_speed
        if new_y < (self.window_height - self.paddle_height):
            padd_obj.padd_pos = x, new_y
        else:
            padd_obj.padd_pos = x, (self.window_height - self.paddle_height)
            
        padd_obj.update_scope()
    
    
    def on_bottom_keys_press(self, padd_obj):
        # print('BBBOTTOM')
        x, y = padd_obj.padd_pos
        new_y = y - self.paddle_speed
        if new_y > 0:
            padd_obj.padd_pos = x, new_y
        else:
            padd_obj.padd_pos = x, 0
        
        padd_obj.update_scope()


def test():
    obj = MoveEvents(None)
    
    direction = 'right'
    game_mode = 'remote'
    key = 'x'
    
    obj.on_press(game_mode, direction, key)
    print(game_mode, direction, 'pressed', key)
    print('    move_up: ', obj.allow_move_up(game_mode, direction))
    print('    move_down: ', obj.allow_move_down(game_mode, direction))
    
    obj.on_release(game_mode, direction, key)
    print(game_mode, direction, 'released', key)
    print('    move_up: ', obj.allow_move_up(game_mode, direction))
    print('    move_down: ', obj.allow_move_down(game_mode, direction))

if __name__ == '__main__':
    test()