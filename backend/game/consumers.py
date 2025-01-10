import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
# from channels.exceptions import DenyConnection
from channels.db import database_sync_to_async

from .remote_game.consumer import RemoteGameConsumer
from .local_game.consumer import LocalGameConsumer

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



class LocalConsumer(LocalGameConsumer):
    pass
    

class GlobalConsumer(RemoteGameConsumer):
    pass

    
