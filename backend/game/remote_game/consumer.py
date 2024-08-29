
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.pong_root import PingPongGameLogic
import uuid

class remoteGameConsumer(AsyncWebsocketConsumer):
    
    group_connection_counts = {}
    game_logic = PingPongGameLogic
    async def connect(self):
        all_groups_have_two = self.all_groups_have_two()
        if all_groups_have_two:
            self.group_name = 'group_' + str(uuid.uuid4())
            self.group_connection_counts[self.group_name] = {
                'count': 1,
                'channels': []
            }
            self.group_connection_counts[self.group_name]['channels'].append(self.channel_name)
            await self.channel_layer.group_add(self.group_name, self.channel_name)
        else:
            for group_name, group_info in self.group_connection_counts.items():
                if group_info['count'] < 2:
                    group_info['count'] += 1
                    group_info['channels'].append(self.channel_name)
                    await self.channel_layer.group_add(group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.get_group(self.channel_name),
            {
                'type': 'chat_message',
                'message': 'start_game'
            }
        )
        await self.accept()

    async def chat_message(self, event):
        message = event["message"]
        print('in the chat_message event handler')
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))

        print(f"\nuser connected {self.channel_name}\n")
        self.game_logic.set_game_mode(self, 'remote')
        print("-------------------------------------------")

    async def disconnect(self, *arg, **kwrags):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
    
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
        
        self.game_engine.recieve(self.channel_namex, data)
    
    def send_game_message(self, event):
        try:
            # dont await it
            self.send(text_data=json.dumps(event))
        except:
            print("Exception: send_game_message: Failed")
