import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from channels.exceptions import DenyConnection
from channels.db import database_sync_to_async

from pong.utils.consumer import EventLoopManager


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



class NewGameConsumer(AsyncWebsocketConsumer):
    
    game_engine = EventLoopManager
    
    async def connect(self):
        self.game_engine.run_event_loop()

        await self.accept()

        self.channel_name = self.scope['channel_name']
        self.game_engine.add(self.channel_name, self.send_message)
        self.game_engine.play(self.channel_name)

        
    async def disconnect(self, close_code=0):
        self.game_engine.stop(self.channel_name)
    
    async def receive(self, text_data):
        data = {}
        try:
            data = json.loads(text_data)
        except:
            print('EXCEPTION: received invaled data from the socket')
        
        self.game_engine.dispatch_recieved_event(self.channel_name, data)
    
    def send_message(self, event):
        try:
            asyncio.create_task(self.send(text_data=json.dumps(event)))
        except:
            print("Exception: send_message: Failed")
