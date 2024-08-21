try:
    from .pong_base import Base
    from .pong_paddles import Paddle
    from .pong_ball import Ball
except:
    from pong_base import Base
    from pong_paddles import Paddle
    from pong_ball import Ball

from copy import deepcopy

class RootBase(Base):
    
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.left_player = Paddle('left', root_obj=self)
        self.right_player = Paddle('right', root_obj=self)
        self.ball = Ball(root_obj=self)
        self.scope = {}
        self.start_game = False
        self.game_mode = 'local' # options: [local, remote]
    
    ###############################################
    def set_game_mode(self, game_mode):
        self.game_mode = game_mode
    
    @property
    def get_next_frame(self):
        data = deepcopy(self.scope)
        self.scope.clear()
        return data
    
    @property
    def get_game_config(self):
        conf = super().get_game_config
        self = self.ball.root_obj
        data = {
            'left_player_score': self.left_player.score,
            'right_player_score': self.right_player.score,
            'left_paddle_pos': self.left_player.padd_pos,
            'right_paddle_pos': self.right_player.padd_pos,
        }
        conf.update(data)
        del conf['ball_pos']
        return self.transform(conf)

    def is_finished(self):
        try:
            self.scope['finished']
            # game is finished here
            # self.reset_to_default_state()
            # self.ball.move_paddles(self.game_mode)
            # self.ball.move(self.game_mode)
            return True
        except:
            return False
    ###############################################
    
    def move_paddles(self):
        # scope or frame will be updated inside move_paddles method
        # print('before_pos=', l.padd_pos)
        if not self.start_game:
            return
        self.ball.move_paddles(self.game_mode)
        # print('after_pos=', l.padd_pos)
        
        # update frame here with paddles pos
        # if self.debug :
        #     print('++++++++++')
        #     self.left_padd_win.pos = self.left_player.padd_pos
        #     self.right_padd_win.pos = self.right_player.padd_pos
    
    def update(self) -> dict:
        if not self.start_game:
            return
        self.move_paddles() # update paddles pos if there is a press event
        self.ball.move(self.ball_win)
        return self.transform(self.get_next_frame)

    def transform(self, frame):
        """
        The back-end game x,y coordinates origin is bottom-left.
        but front-end uses top-left origin.
        
        So this method changes origin from
        bottom-left to top-left before sending
        it to the front-end.
        
        we need just to transform y.
        """
        # print('--->>>>>>>>>>>>>>\n', frame)
        try:
            if frame.get('ball_pos', None) is not None:
                frame['ball_pos'][1] = self.window_height - frame['ball_pos'][1] - self.ball_height
                
            if frame.get('left_paddle_pos', None) is not None:
                frame['left_paddle_pos'][1] = self.window_height - frame['left_paddle_pos'][1] - self.paddle_height
                
            if frame.get('right_paddle_pos', None) is not None:
                frame['right_paddle_pos'][1] = self.window_height - frame['right_paddle_pos'][1] - self.paddle_height
        except Exception as e:
            print('********', e)
        # print('--->>>>>>>>>>>>>>\n', frame)
        return frame
    
    def play(self):
        self.start_game = True
    
    def pause(self):
        self.start_game = False
    
    def reset_to_default_state(self):
        # keep scope saved\
        self.ball.reset_keys_state(self.game_mode, 'left') # reset any pressed key to not pressed
        self.ball.reset_keys_state(self.game_mode, 'right') # reset any pressed key to not pressed
        self.left_player = Paddle('left', root_obj=self)
        self.right_player = Paddle('right', root_obj=self)
        self.ball = Ball(root_obj=self)
        self.start_game = False


class PingPongGame(RootBase):
    """
    All game logic is implemented here.
    This class represents a single ping pong game.
    You should use this class when you want another game instance.
    """
    
    def update(self, *args):
        """
        game engine will call this in order
        to update the state of the game.
        
        Ball pos and Paddles pos.

        output events:
            - left_paddle_pos
            - right_paddle_pos
            - right_player_score
            - left_player_score
            - ball_pos
            - finished
        """
        # print('here')
        # super().move_paddles(82, 82, 82, 82, 82);
        return super().update()
    
    def on_press(self, player_direction: str, key:str=None):
        """
        Call this when new key is pressed.
        """
        self.ball.on_press(self.game_mode, player_direction, key)

    def on_release(self, player_direction: str, key: str):
        """
        Call this when new key is released.
        """
        # print('mode: ', self.game_mode)
        self.ball.on_release(self.game_mode, player_direction, key)

    def debug_key_down(self, instance, keyboard, keycode, text, modifiers):
        keys={82: 'ArrowUp',81:'ArrowDown', 26:'w', 22:'s'}
        key = keys.get(keycode, None)
        if key is not None:
                self.on_press('left', key)
                self.on_press('right', key)
        
    def debug_key_up(self, a, b,c):
        keys={82: 'ArrowUp',81:'ArrowDown', 26:'w', 22:'s'}
        key = keys.get(c, None)
        if key is not None:
                self.on_release('left', key)
                self.on_release('right', key)
        