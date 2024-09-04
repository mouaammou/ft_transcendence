import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.pong_root import PingPongGameLogic
from .random_game import PlayerManager

class remoteGameConsumer(AsyncWebsocketConsumer):
    player_manager = PlayerManager()
    games = {}
    game_logic = PingPongGameLogic()
    game_logic.set_game_mode('local')
    game_logic.play()

    async def connect(self):
        await self.accept()
        # self.player_id = self.scope['url_route']['kwargs']['player_id']
        print(f"\n-----------INIT==========\n")
        print(f"{self.scope['user'].id}\n")
        print(self.scope['user'])
        print(f"\n-----------INIT==========\n")
        # await self.accept()
        config = {'config' : self.game_logic.get_game_config}
        print(config)
        await self.send(text_data=json.dumps(config))
        while True:
            frame = self.game_logic.update()
            print(f"\n{frame}  -------+++++++\n")
            if frame is None:
                # del self.game_logic
                break
            update = {'update':frame}
            print(update)
            asyncio.create_task(self.send(text_data=json.dumps(update)))
            # print(frame)
            await asyncio.sleep(1/60)
           
    async def disconnect(self, close_code):
        self.game_logic.disconnected = True
        await self.close()

    async def receive(self, text_data, *args, **kwargs):
        data = {} 
        try:
            data = json.loads(text_data)
        except:
            print('EXCEPTION: received invaled data from the socket')
        print(f"\nThe DATA RECEIVED --> {data}\n")
        press = data.get('onPress')
        release = data.get('onRelease')
        if press is not None and press.strip() == 'p':
            self.game_logic.start_game = not self.game_logic.start_game
            return
        elif press is not None and press.strip() == 'esc':
            self.game_logic.start_game = not self.game_logic.start_game
            return
        if press is not None:
            print(f"\nINSIDE THE RECEIVE METHODE\n")        
            self.game_logic.on_press('left', press.strip())
            self.game_logic.on_press('right', press.strip())
        elif release is not None:
            print(f"\nINSIDE THE RECEIVE METHODE\n")        
            self.game_logic.on_release('left', release.strip())
            self.game_logic.on_release('right', release.strip())
