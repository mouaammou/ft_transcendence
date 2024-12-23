import math
import random


def to_be_overridden(func):
    return func

class Base:
    """Bottom left corner is x=0, y=0"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # new features
        # self.scope = {} # frame data will be put here
        self.fps = 60
        self.max_score = 500
        
        # assert self.max_score % 2 == 1, ValueError('value should be odd')
        
        
        # old ones
        # self.window_width = 1600   
        # self.window_height = 1200
        self.window_width = 900
        self.window_height = 400
        
        self.paddle_width = 15
        self.paddle_height = self.window_height/3.5
        self.paddle_speed = 9
        
        self.ball_width = 25
        self.ball_height = self.ball_width
        self.ball_speed = 12
        self.max_ball_speed = 25
        self.ball_speed_increase_factor = 0.2 
        self.ball_start_speed = 5 # ball restart speed on score increase
        self.ball_reset_speed = self.ball_speed # for reset on ball restart
        
        self.window_center_x = self.window_width / 2
        self.window_center_y = self.window_height / 2
        
        self.left_paddle_start_x = 0
        self.left_paddle_start_y = self.window_center_y - self.paddle_height/2
        
        self.right_paddle_start_x = self.window_width - self.paddle_width
        self.right_paddle_start_y = self.window_center_y - self.paddle_height/2
        
        # self.left_ball_start_x = self.paddle_width
        # self.left_ball_start_y = self.window_center_y - self.ball_height/2
        
        self.ball_start_x = self.window_center_x - self.ball_width/2
        self.ball_start_y = self.window_center_y - self.ball_height/2
        
        self.right_ball_start_x = self.window_width - self.paddle_width - self.ball_width
        self.right_ball_start_y = self.window_center_y - self.ball_height/2
        
        self.debug = False
    
        self.ball_win   = None # for debug

        self.left_nickname = None
        self.right_nickname = None
        self.title = None
        self.local_game_type = None
        self.tournament_id = None
        
    
    @property
    def get_game_config(self):
        return {
            "window_size": [self.window_width, self.window_height],
            
            "paddles_size": [self.paddle_width, self.paddle_height],
            "left_paddle_pos": [self.left_paddle_start_x, self.left_paddle_start_y],
            "right_paddle_pos": [self.right_paddle_start_x, self.right_paddle_start_y],
            
            "ball_size": [self.ball_width, self.ball_height],
            "ball_pos": [self.ball_start_x, self.ball_start_y],
            
            "left_player_score": 0,
            "right_player_score": 0,
            "max_score": self.max_score,
            
            'left_nickname': self.left_nickname,
            'right_nickname': self.right_nickname,

            'title': self.title,
            'local_game_type': self.local_game_type,
            'tournament_id': self.tournament_id,
        }
        