from kivy.core.window import Window
from kivy.uix.widget import Widget

class Keyboard:
    _top_keys = [82]
    _bottom_keys = [81]
    __keys = [*_top_keys, *_bottom_keys]
    
    def __init__(
        self,
        *,
        parent_widget: Widget,
        ball_widget: Widget,
        left_padde: Widget,
        right_paddle: Widget,
        **kwargs,
    ):
        self.ball = ball_widget
        self.parent = parent_widget
        self.left_paddle = left_padde
        self.right_paddle = right_paddle
        Window.bind(on_key_down=self._on_key_press)
        Window.bind(on_key_up=self._on_key_release)
    
    def _on_key_press(self, instance, keyboard, keycode, text, modifiers):
        # print('key_press=', keycode)
        if keycode in self.__class__.__keys :
            #check where the ball pos to know which paddle to move
            if self.ball.pos[0] <= self.parent.width/2:
                self.__on_left_keys_press(keycode)
            else:
                self.__on_right_keys_press(keycode)
    
    def _on_key_release(self, instance, keyboard, keycode):
        if keycode in self.__class__.__keys:
            #check where the ball pos to know which paddle to move
            if self.ball.pos[0] <= self.parent.width/2:
                self.__on_left_keys_release(keycode)
            else:
                self.__on_right_keys_release(keycode)
    
    def __on_left_keys_press(self, key):
        if key in self.__class__._top_keys:
            self.left_top_key_press()
        else:
            self.left_bottom_key_press()
    
    def __on_left_keys_release(self, key):
        if key in self.__class__._top_keys:
            self.left_top_key_release()
        else:
            self.left_bottom_key_release()

    def __on_right_keys_press(self, key):
        if key in self.__class__._top_keys:
            self.right_top_key_press()
        else:
            self.right_bottom_key_press()
    
    def __on_right_keys_release(self, key):
        if key in self.__class__._top_keys:
            self.right_top_key_release()
        else:
            self.right_bottom_key_release()
    #top
    def right_top_key_press(self):
        print('right_top_key_press')
    def right_bottom_key_press(self):
        print('right_bottom_key_press')
    def right_top_key_release(self):
        print('right_top_key_release')
    def right_bottom_key_release(self):
        print('right_bottom_key_release')
    #left
    def left_top_key_press(self):
        print('left_top_key_press')
    def left_bottom_key_press(self):
        print('left_bottom_key_press')
    def left_top_key_release(self):
        print('left_top_key_release')
    def left_bottom_key_release(self):
        print('left_bottom_key_release')