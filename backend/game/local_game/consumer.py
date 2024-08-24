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

        await self.accept()

        # steps bellow is required
        self.channel_name = self.scope['channel_name']
        self.game_engine.connect(self.channel_name, self.send_game_message)
        # dont forget to set timout callback

        
    async def disconnect(self, *arg, **kwrags):
        self.game_engine.disconnect(self.channel_name)
    
    async def receive(self, text_data, *args, **kwargs):
        data = {}
        try:
            data = json.loads(text_data)
        except:
            print('EXCEPTION: received invaled data from the socket')
        
        self.game_engine.recieve(self.channel_name, data)
    
    def send_game_message(self, event):
        try:
            # dont await it
            asyncio.create_task(self.send(text_data=json.dumps(event)))
        except:
            print("Exception: send_game_message: Failed")
