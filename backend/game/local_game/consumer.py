import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
# from channels.exceptions import DenyConnection
from channels.db import database_sync_to_async
from .eventloop import EventLoopManager


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



class LocalGameConsumer(AsyncWebsocketConsumer):
    
    game_engine = EventLoopManager
    
    async def connect(self):
        self.unique_name = None
        self.user = self.scope['user']
        if self.user.is_anonymous:
            return await self.close()
        await self.accept()
        self.is_focused = True
        # steps bellow is required
        self.unique_name = self.scope['channel_name']

        self.game_engine.connect(self.unique_name, self)
        # dont forget to set timout callback

        
    async def disconnect(self, *arg, **kwrags):
        self.game_engine.disconnect(self.unique_name)
    
    async def receive(self, text_data, *args, **kwargs):
        data = {}
        try:
            data = json.loads(text_data)
        except:
            print('EXCEPTION: received invaled data from the socket')
        self.is_focused = data.get('tabFocused', True)
        # print("}"*30)
        # print(data)
        # print("}"*30)
        self.game_engine.recieve(self.unique_name, data)
    
    def send_game_message(self, event):
        try:
            # dont await it
            asyncio.create_task(self.safe_send(event))
        except Exception as e:
            print("Exception: send_game_message: Failed", e)
    
    async def safe_send(self, event):
        try:
            await self.send(text_data=json.dumps(event))
        except:
            print("Exception: safe_send: Failed [no problem it can function without it]")
