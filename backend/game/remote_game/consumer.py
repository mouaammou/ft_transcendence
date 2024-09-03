import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.pong_root import PingPongGameLogic
import uuid

class remoteGameConsumer(AsyncWebsocketConsumer):
    
    group_connection_counts = {}
    game_logic = PingPongGameLogic()
    make_grp = False
    # if game_logic:
    #         game_logic.play()
    async def connect(self):
        await self.accept()
        self.make_grp = self.all_groups_have_two()
        if self.make_grp:
            self.group_name = 'group_' + str(uuid.uuid4())
            self.group_connection_counts[self.group_name] = {
                'count': 1,
                'channels': []
            }
            self.group_connection_counts[self.group_name]['channels'].append(self.channel_name)
            # await self.channel_layer.group_add(self.group_name, self.channel_name)
        else:
            for group_name, group_info in self.group_connection_counts.items():
                if group_info['count'] < 2:
                    group_info['count'] += 1
                    group_info['channels'].append(self.channel_name)
                    # await self.channel_layer.group_add(group_name, self.channel_name)
        self.print_all_groups()
        self.make_grp = self.all_groups_have_two()
        if self.make_grp == True:
            # await self.channel_layer.group_send(
            #     self.get_group(self.channel_name),
            #     {
            #         'type': 'chat_message',
            #         'message': 'start_game',
            #         'config': self.game_logic.get_game_config
            #     }
            # )
            await self.send(text_data=json.dumps({'config': self.game_logic.get_game_config}))
            self.game_logic.play()
            while True:
                frame = self.game_logic.update()
                update = {'update':frame}
                # print(frame)
                asyncio.create_task(self.send(text_data=json.dumps(update)))
                await asyncio.sleep(1/60)
           
    async def disconnect(self):
        self.game_logic.disconnected = True
        await self.close()

    async def chat_message(self, event):
        message = event["message"]
        dfg = event["config"]
        data = { 'config':dfg }
        print('in the chat_message event handler')
        print('->'*43)
        print(f"\n{dfg}\n")
        # Send message to WebSocket
        await self.send(text_data=json.dumps((data)))

        print(f"\nuser connected {self.channel_name}\n")
        self.game_logic.set_game_mode('remote')


    def print_all_groups(self):
        print("-------------------------------------------")
        for group_name, info in self.group_connection_counts.items():
            print(f"Group Name: {group_name}, Count: {info['count']}, Channels: {info['channels']}")

    
    def get_group(self, channel_name):
        print(f"\n--------------------\n")
        for group, group_info in self.group_connection_counts.items():
            if channel_name in group_info['channels']:
                return group
            

    def all_groups_have_two(self):
        if not self.group_connection_counts:
            return True
        for group in self.group_connection_counts.values():
            if group['count'] != 2:
                return False
        return True

    async def receive(self, text_data, *args, **kwargs):
        data = {}
        try:
            data = json.loads(text_data)
        except:
            print('EXCEPTION: received invaled data from the socket')
        
        # print(f"\n{data}\n")
        print(f"\n{data}\n")
        self.game_logic.play()
        press = data.get('onPress')
        release = data.get('onRelease')
        if press is not None and press.strip() == 'p':
            self.game_logic.start_game = not self.game_logic.start_game
            return
        elif press is not None and press.strip() == 'esc':
            self.game_logic.start_game = not self.game_logic.start_game
            return
        if press is not None:
            self.game_logic.on_press('left', press.strip())
            self.game_logic.on_press('right', press.strip())
        elif release is not None:
            self.game_logic.on_release('left', release.strip())
            self.game_logic.on_release('right', release.strip())
        # self.game_engine.recieve(self.channel_namex, data)

    def send_game_message(self, event):
        try:
            # dont await it
            print(f"\n -------------------- send game message --------------------")
            print(json.dump(event))
            print(f"\n -------------------- send game message --------------------")
            self.send(text_data=json.dumps(event))
        except:
            print("Exception: send_game_message: Failed")
