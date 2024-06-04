import math

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
        
        self._step_x = self.ball_speed
        self._step_y = 1
        
        if to_left:
            self._step_x = -self._step_x
        
        # self.ball_speed += 0.314


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