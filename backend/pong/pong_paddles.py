try:
    from .pong_base import Base
    # from .pong_root import PingPongGame #remove to avoid circular import
except:
    from pong_base import Base
    # from pong_root import PingPongGame 
            


class Paddle(Base):
    
    def __init__(self, direction, root_obj, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.root_obj = root_obj
        
        if direction not in ['left', 'right']:
            raise ValueError('allowed values are "left" and " right"')
        self.direction = direction
        self.__x = self.left_paddle_start_x if direction == 'left' else self.right_paddle_start_x
        self.__y = self.left_paddle_start_y if direction == 'left' else self.right_paddle_start_y
        self.score = 0
    
    
    @property
    def padd_size(self):
        return (self.paddle_width, self.paddle_height)
    
    
    @property
    def padd_pos(self):
        return [self.__x, self.__y]
    
    @padd_pos.setter
    def padd_pos(self, pos: tuple):
        # print('padd_pos:' , pos)
        self.__x, self.__y = pos
    
    
    def padd_move_up(self):
        # self.__y += self.root_obj.ball.pos[0]
        self.__y += self.paddle_speed
        if self.__y + self.paddle_height > self.window_height:
            self.__y = self.window_height - self.paddle_height
    
    def padd_move_down(self):
        # self.__y += self.root_obj.ball.pos[0]
        self.__y -= self.paddle_speed
        if self.__y < 0:
            self.__y = 0
    
    def handle_score(self):
        self.score += 1
        self.root_obj.scope[self.direction+'_player_score'] = self.score
        if self.score >= self.max_score:
            print(f'{self.direction}_player win!')
            self.root_obj.scope['finished'] = self.direction+'_'+'player'
            # self.root_obj.start_game = False
            self.root_obj.reset_to_default_state() # reset the game but keep the scope
            # self.root_obj.winner = self.root_obj.get_nickname(self.direction) # for tournament
            if hasattr(self.root_obj, 'winner'):
                setattr(self.root_obj, 'winner', f'{self.direction}_nickname')
            # self.root_obj.winner = getattr(self, self.direction+'_nickname')
            if hasattr(self.root_obj, 'save_match'):
                self.root_obj.save_match(self.direction)#// madafaking samjaabo, id iski tich, awi ikhan nk skran mani yadni
    
    def update_scope(self):
        # on paddle move only
        self.root_obj.scope[self.direction+'_paddle_pos'] = self.padd_pos
