import asyncio
import json
import logging
from .players_games_manager import PlayersGamesManager 
from channels.generic.websocket import AsyncWebsocketConsumer


class ConnectFourConsumer(AsyncWebsocketConsumer):
       
    games_manager = PlayersGamesManager 
    async def connect(self):
        self.user = self.scope['user']
        self.player_id = self.scope['user'].id
        if self.user and not self.user.is_authenticated:  
            return
        await self.accept()
        print(f"Player {self.player_id} connected")
        self.games_manager.connect(self, self.player_id)
            
    
    
    async def disconnect(self, close_code):
        await self.games_manager.disconnect(self.player_id)    
        # logging.info(f"Player {self.player_id} disconnected with code {close_code}")
              
    async def receive(self, text_data):
        try: 
            if not self.player_id:
                return
            parsed_data = json.loads(text_data)
            if 'type' in parsed_data and parsed_data['type'] == 'LEAVE_GAME':
                await self.games_manager.disconnect(self.player_id)
                return
            self.games_manager.receive(self.player_id, parsed_data)
        except json.JSONDecodeError as ex:
            logging.error(f'EXCEPTION: received invaled data from the socket -> {ex}')
            
    def send_game_message(self, event):
        try: 
            asyncio.create_task(self.send(text_data=json.dumps(event)))
        except Exception as ex:
            logging.error(f"EXCEPTION in sendding message in fourGame consumer -> {ex}")  