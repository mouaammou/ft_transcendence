import json
from pong.pong_base import Base
from pong.pong_engine import GameEngine
# from copy import deepcopy
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer, AsyncJsonWebsocketConsumer
from channels.exceptions import DenyConnection
from channels.db import database_sync_to_async

class BaseAsyncConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if user is None or user.is_anonymous:
            raise DenyConnection('Not allowed to access this resource')
        
    def db_get_room_name(self) -> bool:
        pass

class PongRoomConsumer(AsyncWebsocketConsumer):
    
    game_engine = GameEngine()
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # asyncio.create_task(self.event_loop())
        # self.game_engine.set_callback(self.send_message)
        self.game_engine.init_event_loop()
    
    async def connect(self):
        # self.group_name = 
        await self.accept()
        self.game_engine.new_game()
        # self.game_engine.game_objs[0].reset_to_default_state()
        self.game_engine.set_callback(self.send_message)
        self.game_engine.play_game_after_seconds()
        
        # print('Websocket Connection accepted', self.channel_name)

        self.my_start_up_data = Base().get_game_config
        await self.send_message({'config': self.my_start_up_data})
        
        # self.game_engine.game_objs['pong_group'].play()
        # if not __class__.is_runing_loop:
            # print("************Hello**************")
            # self.game_engine.add_new_game('pong_group')
            # asyncio.create_task(self.event_loop())
            # __class__.is_runing_loop = True
    
    async def disconnect(self, close_code):
        print('websocket disconnected')
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except:
            print('EXCEPTION: received invaled data from the socket')
        
        # message = text_data_json['message']
        # print()
        # print('recieved a message: ', message)
        game = self.game_engine.game_objs[0]
        # print('data:<', data, '>')
        if data.get('onPress', None) is not None:
            game.on_press('left', data.get('onPress').strip())
            game.on_press('right', data.get('onPress').strip())
        elif data.get('onRelease', None) is not None: 
            game.on_release('left', data.get('onRelease').strip())
            game.on_release('right', data.get('onRelease').strip())
            # print('keyyyyy: ', key)

            
    
    async def send_message(self, event):
        # print('*****', json.dumps({'message': event['message']}))
        # print(event)
        config = event.get('config', False)
        update = event.get('update', False)
        try:
            if config:
                asyncio.create_task(self.send(text_data=json.dumps({'config': config})))
            elif update:
                # print(json.dumps(event))
                # print(json.dumps({'update': config}))
                asyncio.create_task(self.send(text_data=json.dumps(event)))
        except Exception as e:
            print("EXCEPTION:--->", e)
