from typing import List, Callable, Dict
from channels.generic.websocket import AsyncWebsocketConsumer

from contextlib import contextmanager, asynccontextmanager
import asyncio

try:
    from .pong_root import PingPongGame
    from .pong_base import Base
except:
    from pong_root import PingPongGame
    from pong_base import Base


class ConsumerGameMiddlware:
    
    game_class = PingPongGame
    
    def __init__(self, uid: int, consumer: AsyncWebsocketConsumer):
        self.consumers = {uid: consumer}
    
    def add_consumer(self, uid: int, consumer: AsyncWebsocketConsumer) -> None:
        self.consumers[uid] = consumer
    
    #------------------------------------
    
    def disconnected(self, uid):
        pass
    
    def send_to_all(self):
        for _, consumer in self.consumers.items():
            consumer.send()

class GameEngine(Base):
    """
    Create a single thread, And run event loop to update
    the state of all games everyand create a frame.
    """
    # i can use dict instead to map channel group with a game
    game_objs: List[PingPongGame] = [PingPongGame()]
    event_loop_task = None
    
    def __init__(self, *args, **kwargs):
        super().__init__( *args, **kwargs)
        
        # if __class__.event_loop_task is not None:
        #     return # raise error more than one call
        # __class__.event_loop_task = asyncio.create_task(self.event_loop())
    
    def init_event_loop(self):
        if __class__.event_loop_task is not None:
            return # raise error more than one call
        __class__.event_loop_task = asyncio.create_task(self.event_loop())
    
    def set_callback(self, callback: Callable):
        self.send_callback = callback
    
    def new_game(self):
        self.game_objs[0] = PingPongGame()
        self.game_objs[0].play()
    
    async def event_loop(self):
        print("event-loop-started")
        __class__.game_objs[0].play()
        while True:
            
            # for game in __class__.game_objs:
            game = __class__.game_objs[0]
            # print('x')
            frame = game.update()
            # print('sdfdsfdsfx')
            # if hasattr(self, 'send_callback'):
            #     print('send')
            try:
                # print(frame)
                asyncio.create_task(self.send_callback({'update': frame}))
            except:
                pass
            await asyncio.sleep(1/80)
        print('event-loop-finished')
    
    # def add_new_game(self, game_id):
    #     # i need id that is used in jwd
    #     # __class__.game_objs.append([__class__.game_class()])
    #     pass
    
    async def sleep(self):
        # sleep in milli seconds
        await asyncio.sleep(1/60)
    
    async def play_game_after_seconds(self):
        await asyncio.sleep(2)
        __class__.game_objs[0].play()
