

from channels.generic.websocket import AsyncWebsocketConsumer

class remoteGameConsumer(AsyncWebsocketConsumer):
    num_users = 0

    @classmethod
    def count_users(self):
        if self.num_users == 0:
            pass