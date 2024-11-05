import math

try:
    from .pong_base import Base
except:
    from pong_base import Base



class Angle(Base):
    
    __hpi = math.pi / 2
    
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.__height = self.paddle_height + self.ball_height
        # print('padd_height:' , self.__height)
        self.__height2 = self.__height / 2
        
        self.__padd_center = self.paddle_height/2
        self.__ball_center = self.ball_height/2
    
    
    def relative_ball_to_paddle(self, ball_y, padd_y):
        # print(f'bally: {ball_y} | padd_y0: {padd_y} | padd_y1: {padd_y+self.paddle_height}')
        ball_y += self.__ball_center
        padd_y += self.__padd_center
        relative_value = (padd_y - ball_y)
        return -relative_value


    def relative_angle(self, ball_y, padd_y):
        relat_value = self.relative_ball_to_paddle(ball_y, padd_y)
        # print('rel: ', relat_value, 'height: ', self.__height2)
        linear_interp = relat_value * (self.__hpi/2) / self.__height2
        return linear_interp
    
    
    def new_angle(self, ball_y, padd_y, direction, /):
        angle = self.relative_angle(ball_y, padd_y) 
        if direction == 'left':
            # print('--------->', direction, angle + math.pi)
            # print('left-a')
            return angle + math.pi
    
        elif direction == 'right':
            # print('--------->', direction, -angle)
            # print('right-a')
            return -angle
        
        else:
            raise ValueError("allowed values are: 'right' and 'left' ")

