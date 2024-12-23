# from .base import Base
import math
import random

try:
    from .pong_angle import Angle
except:
    from pong_angle import Angle


class Collisions(Angle):
    
    
    @staticmethod
    def positive(value):
        return abs(value)
    
    
    @staticmethod
    def negative(value):
        return -abs(value)
    
    
    def detect_window_collision(self, ball_obj, bx, by):
        if by < 0:
            self.on_bottom_window_collision(ball_obj)
        elif by > self.window_height - self.ball_height:
            self.on_top_window_collision(ball_obj)
        elif bx < 0:
            self.on_left_window_collision(ball_obj)
        elif bx > self.window_width - self.ball_width:
            self.on_right_window_collision(ball_obj)
        else:
            return False
        return True
    
    
    def detect_paddle_collision(self, ball_obj, direction, bx, by, px, py):
        bw, bh = bx + self.ball_width, by + self.ball_height
        pw, ph = px + self.paddle_width, py + self.paddle_height

        # x overlap from left or right
        if bw < px or bx > pw:
            return False
        # y overlap from top or down
        if bh < py or by > ph:
            return False
        if direction == 'left':
            self.on_left_padd_collision(ball_obj)
        else:
            self.on_right_padd_collision(ball_obj)
        return True
    
    
    def on_left_window_collision(self, root_obj):
        # you lose
        # print('you lose')
        root_obj.ball_pos = self.window_center_x, self.window_center_y
        # root_obj.right_player.score += 1 # you add players and ball to a root class
        root_obj.right_player.handle_score()
        root_obj.ball.restart_ball(to_left=True)
        # print(f'score: [{root_obj.left_player.score} | {root_obj.right_player.score}]')
    
    
    def on_right_window_collision(self, root_obj):
        # you lose
        root_obj.ball_pos = self.window_center_x, self.window_center_y
        # root_obj.left_player.score += 1 # you add players and ball to a root class
        root_obj.left_player.handle_score()
        root_obj.ball.restart_ball(to_left=False)
        # print(f'score: [{root_obj.left_player.score} | {root_obj.right_player.score}]')
    
    
    def on_bottom_window_collision(self, ball_obj):
        # reflect the ball
        sx, sy = ball_obj.ball._step_x, ball_obj.ball._step_y
        if sx < 0 and sy < 0:
            # bottom-left to top-left
            ball_obj.ball._step_y = self.positive(sy) 
        else:
            # bottom-right to top-right
            ball_obj.ball._step_y = self.positive(sy)
    
    
    def on_top_window_collision(self, ball_obj):
        sx, sy = ball_obj.ball._step_x, ball_obj.ball._step_y
        if sx < 0 and sy > 0:
            # top-left to bottom-left
            ball_obj.ball._step_y = self.negative(sy)
        elif sx > 0 and sy > 0:
            # top-right to bottom-right
            ball_obj.ball._step_y = self.negative(sy)

    def on_left_padd_collision(self, ball_obj):
        self.increase_ball_speed()
        _, ball_y = ball_obj.ball.ball_pos
        _, padd_y = ball_obj.left_player.padd_pos
        
        # print('on_left_padd_collision', padd_y)
        angle = self.new_angle(ball_y, padd_y, 'right')
        # x, y
        x = math.cos(angle) * self.ball_speed
        y = math.sin(angle) * self.ball_speed
        # add sign
        if angle < 0:
            ball_obj.ball._step_x = self.positive(x)
            ball_obj.ball._step_y = self.positive(y)
        else:
            ball_obj.ball._step_x = self.positive(x)
            ball_obj.ball._step_y = self.negative(y)
    
        # self.ball_speed += 10
        # print('spedd: ',ball_obj.ball_speed)
            
            
    def on_right_padd_collision(self, ball_obj):# ball_obj=root_obj
        self.increase_ball_speed()
        _, ball_y = ball_obj.ball.ball_pos
        _, padd_y = ball_obj.right_player.padd_pos
        # print('on_right_padd_collision', padd_y)
        
        angle = self.new_angle(ball_y, padd_y, 'left')
        
        # x, y
        x = math.cos(angle) * self.ball_speed
        y = math.sin(angle) * self.ball_speed
        # add sign
        if angle >= math.pi:
            ball_obj.ball._step_x = self.negative(x)
            ball_obj.ball._step_y = self.positive(y)
        else:
            ball_obj.ball._step_x = self.negative(x)
            ball_obj.ball._step_y = self.negative(y)
    
    def increase_ball_speed(self):
        if self.ball_speed < self.max_ball_speed:
            self.ball_speed += self.ball_speed_increase_factor

