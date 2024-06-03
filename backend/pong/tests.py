
try: 
    from .pong_root import PingPongGame, Base
except:
    from pong_root import PingPongGame,Base
    

from kivy.config import Config
 
# # 0 being off 1 being on as in true / false
# # you can use 0 or 1 && True or False
# Config.set('graphics', 'resizable', '0')
 
# fix the width of the window 
a=Base()
Config.set('graphics', 'width', str(a.window_width//2))
Config.set('graphics', 'height', str(a.window_height//2))

#############################################################
#############################################################
#############################################################
#############################################################

from kivy.app import App
from kivy.uix.widget import Widget
from kivy.uix.label import Label
from kivy.graphics import Rectangle, Color, Ellipse, Line
from kivy.clock import Clock
from kivy.core.window import Window

# For Debug
class Pong(Widget, PingPongGame):
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # self.size_hint = (None, None)
            
        with self.canvas:
            Color(1, 1, 1)
            self.ball_win = Rectangle(
                pos=self.ball.ball_pos,
                size=self.ball.ball_size,
            )
            Color(1, .5, 1)
            self.rect = Rectangle()# center net
            
            self.left_padd_win = Rectangle(
                pos=self.left_player.padd_pos,
                size=self.left_player.padd_size,
            )
            
            self.right_padd_win = Rectangle(
                pos=self.right_player.padd_pos,
                size=self.right_player.padd_size,
            )
        
        self.bind(size=self.on_size)
        self.bind(pos=self.on_pos)
        Window.bind(on_key_down=self.debug_key_down)
        Window.bind(on_key_up=self.debug_key_up)
    
    
    def on_size(self, inst, value):
        if hasattr(self, 'rect'):
            self.rect.pos = (self.center_x - 5, 0)
            self.rect.size = (10, self.height)
            self.window_width = value[0]
            self.window_height = value[1]
            # self.update_config()
        # if hasattr(self, 'left_paddle'):
        #     self.left_paddle.on_parent(inst, value)
        # if hasattr(self, 'right_paddle'):
        #     self.right_paddle.on_parent(inst, value)
        print('size=', value)
    
    def on_pos(self, inst, value):
        if hasattr(self, 'ball'):
            self.ball.pos = 25, self.center_y
    
    
    def on_touch_down(self, touch):
        self.play()


class Main(App):
    
    def build(self):
        self.app = Pong()
        Clock.schedule_interval(self.app.update, 0)
        # Clock.schedule(app.update)
        return self.app


    def on_stop(self):
        print('='*30)
        print(self.app.scope)
        return super().on_stop()



if __name__ == '__main__':
    Main().run()