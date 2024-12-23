import math
import random

try:
    from .pong_collisions  import Collisions
    from .pong_movements import Movements
except:
    from pong_collisions  import Collisions
    from pong_movements import Movements
    


class BallBase(Collisions, Movements):
    
    def __init__(self, root_obj, **kwargs):
        super().__init__(**kwargs)
        self.root_obj = root_obj
        
        self._step_x = 1
        self._step_y = 1
        self.angle = math.pi/3
        self.__x = self.ball_start_x
        self.__y = self.ball_start_y
        self.is_left_turn = bool(random.randint(0 ,1))
        self.restart_ball()
    
    
    @property
    def steps(self):
        return self.__step_x, self._step_y
    
    
    @steps.setter
    def steps(self, xy):
        self._step_x, self._step_y = xy
    
    
    @property
    def angle(self, angle):
        raise ValueError('no getter')
    
    
    @angle.setter
    def angle(self, angle):
        self._step_x = math.cos(angle) * self.ball_speed
        self._step_y = math.sin(angle) * self.ball_speed
    
    
    @property
    def ball_size(self):
        return (self.ball_width, self.ball_height)
    
    
    @property
    def ball_pos(self):
        return [self.__x, self.__y]
    
    
    @ball_pos.setter
    def ball_pos(self, pos: tuple):
        self.__x, self.__y = pos
    
    
    def collision(self):
        if self.detect_paddle_collision(self.root_obj, 'left', *self.ball_pos, *self.root_obj.left_player.padd_pos):
            # print('left padd collision')
            pass
        elif self.detect_paddle_collision(self.root_obj, 'right', *self.ball_pos, *self.root_obj.right_player.padd_pos):
            # print('right padd collision')
            pass
        elif self.detect_window_collision(self.root_obj, *self.ball_pos):
            # print('window collision')
            pass
    
    
    def move(self):
        self.collision()
        self.move_ball(self)
        
    
    def restart_ball(self, to_left=False):
        self.__x = self.ball_start_x
        self.__y = self.ball_start_y
        self.ball_speed = self.ball_reset_speed
        random_angle = self.get_random_angle()
        self._step_x = math.cos(random_angle) * self.ball_start_speed
        self._step_y = math.sin(random_angle) * self.ball_start_speed
        self.is_left_turn = not self.is_left_turn

    def get_random_angle(self, range_degrees=90):
        center_angle = math.pi if self.is_left_turn else 0  # PI for left, 0 for right
        range_radians = math.radians(range_degrees)
        lower_bound = center_angle - range_radians / 2
        upper_bound = center_angle + range_radians / 2
        return random.uniform(lower_bound, upper_bound)


class Ball(BallBase):
    
    def move(self, ball_win):
        super().move()
        if ball_win and ball_win.pos is not None and ball_win.pos[0] is not None:
            if self.debug:
                ball_win.pos = self.ball_pos # for debug
            # you can update frame here (ball pos)
            
        # update the scope
        # print('', self.ball_pos)
        self.root_obj.scope['ball_pos'] = self.ball_pos