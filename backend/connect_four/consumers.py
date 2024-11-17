import asyncio
import json
import logging
from .players_games_manager import PlayersGamesManager 
from channels.generic.websocket import AsyncWebsocketConsumer


class ConnectFourConsumer(AsyncWebsocketConsumer):
       
    games_manager = PlayersGamesManager 
    async def connect(self):
        await self.accept()
        if self.scope['user'].is_authenticated:
            self.player_id = self.scope['user'].id
            print(f"Player {self.player_id} connected")
            self.games_manager.connect(self, self.player_id)
            
    
    
    async def disconnect(self, close_code):
        self.games_manager.disconnect(self.player_id)
        # logging.info(f"Player {self.player_id} disconnected with code {close_code}")
              
    async def receive(self, text_data):
        try: 
            parsed_data = json.loads(text_data)
            self.games_manager.receive(self.player_id, parsed_data)
        except json.JSONDecodeError as ex:
            logging.error(f'EXCEPTION: received invaled data from the socket -> {ex}')
            
    def send_game_message(self, event):
        try: 
            asyncio.create_task(self.send(text_data=json.dumps(event)))
        except Exception as ex:
            logging.error(f"EXCEPTION in sendding message in fourGame consumer -> {ex}")  