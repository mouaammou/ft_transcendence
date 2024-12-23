import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
# from channels.exceptions import DenyConnection
from channels.db import database_sync_to_async

from .event_loop import EventLoopManager


# class BaseAsyncConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         user = self.scope.get('user')
#         if user is None or user.is_anonymous:
#             raise DenyConnection('Not allowed to access this resource')
        
#     def db_get_room_name(self) -> bool:
#         pass


###################################################################################
################################ NEW CONSUMER #####################################
###################################################################################



class RemoteGameConsumer(AsyncWebsocketConsumer):
    
    game_engine = EventLoopManager
    
    async def connect(self): 
        self.user = self.scope['user']
        self.player_id = self.scope['user'].id
        if self.user and not self.user.is_authenticated:  
            return
        await self.accept()
        self.is_focused = False
        self.in_board_page = False
        self.game_engine.connect(self)


    async def disconnect(self, *arg, **kwrags):
        self.game_engine.disconnect(self.player_id)
    
    
    async def receive(self, text_data, *args, **kwargs):
        data = {}
        try: 
            data = json.loads(text_data)
        except:      
            print('EXCEPTION: received invaled data from the socket')
        if 'tabFocused' in data:
            self.is_focused = data.get('tabFocused') 
        if 'inBoardPage' in data:
            self.in_board_page = data.get('inBoardPage')
        print(f"dict data ---------->  {data}  user --------> {self.user.id}")
        if self.player_id is None:
            return
        self.game_engine.recieve(self.player_id, data)
    
    
    def send_game_message(self, event):
        try:
            asyncio.create_task(self.send(text_data=json.dumps(event)))
        except Exception as e:
            print(f"Exception: send_game_message: Failed {e}")
