import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer

from channels.db import database_sync_to_async

from .event_loop import EventLoopManager


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
            pass
        if 'tabFocused' in data:
            self.is_focused = data.get('tabFocused') 
        if 'inBoardPage' in data:
            self.in_board_page = data.get('inBoardPage')

        if self.player_id is None:
            return
        self.game_engine.recieve(self.player_id, data)
    
    
    def send_game_message(self, event):
        try:
            asyncio.create_task(self.send(text_data=json.dumps(event)))
        except Exception as e:
            pass

