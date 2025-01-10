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

        self.__height2 = self.__height / 2
        
        self.__padd_center = self.paddle_height/2
        self.__ball_center = self.ball_height/2
    
    
    def relative_ball_to_paddle(self, ball_y, padd_y):

        ball_y += self.__ball_center
        padd_y += self.__padd_center
        relative_value = (padd_y - ball_y)
        return -relative_value


    def relative_angle(self, ball_y, padd_y):
        relat_value = self.relative_ball_to_paddle(ball_y, padd_y)

        linear_interp = relat_value * (self.__hpi/2) / self.__height2
        return linear_interp
    
    
    def new_angle(self, ball_y, padd_y, direction, /):
        angle = self.relative_angle(ball_y, padd_y) 
        if direction == 'left':


            return angle + math.pi
    
        elif direction == 'right':


            return -angle
        
        else:
            raise ValueError("allowed values are: 'right' and 'left' ")

