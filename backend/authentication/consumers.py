# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        print(f"-- user: {self.user}")
        if self.user.is_authenticated:

            self.channel_layer.group_add(
                f"user_{self.user.id}",
                self.channel_name
            )
            await self.update_user_status(True)
            
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            await self.update_user_status(False)
            await self.channel_layer.group_discard(
                f"user_{self.user.id}",
                self.channel_name
            )
    async def receive(self, text_data):
        pass  # Handle incoming messages if needed

    @database_sync_to_async
    def update_user_status(self, status):
        User.objects.filter(pk=self.user.pk).update(is_online=status)
