from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.core.cache import cache
import json

User = get_user_model()

class OnlineStatusConsumer(AsyncWebsocketConsumer):

    USER_STATUS_GROUP = 'users_status'

    async def connect(self):
        self.user = self.scope["user"]
        print(f"\n-- user: {self.user}\n")
        if self.user.is_authenticated:
            self.cache_key = f"user_{self.user.id}_connections"

            await self.channel_layer.group_add(
                self.cache_key,
                self.channel_name
            )

            await self.channel_layer.group_add(
                self.USER_STATUS_GROUP,
                self.channel_name
            )

            number_of_connexions = await self.increment_connections()
            if number_of_connexions == 1:
                await self.send_status_to_user(True)
                await self.update_user_status(True)
                await self.broadcast_online_status(self.user.id, True)

            await self.accept()
        else:
            await self.close()


    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            number_of_connexions = await self.decrement_connections()
            if number_of_connexions == 0:
                await self.send_status_to_user(False)
                await self.update_user_status(False)
                await self.broadcast_online_status(self.user.id, False)

            await self.channel_layer.group_discard(
                self.cache_key,
                self.channel_name
            )
            await self.channel_layer.group_discard(
                self.USER_STATUS_GROUP,
                self.channel_name
            )

    async def broadcast_online_status(self, user_id, status):# all users
        await self.channel_layer.group_send(
            self.USER_STATUS_GROUP,
            {
                "type": "user_status_change",
                "user_id": user_id,
                "status": status 
            }
        )

    async def user_status_change(self, event):
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                "type": "user_status_change",
                "user_id": event['user_id'],
                "status": event['status']
            }))

    async def send_status_to_user(self, status):
        await self.send(text_data=json.dumps(
            {
                "type": "friend_status",
                "user_id": self.user.id,
                "status": 'online' if status else 'offline'
            }
        ))

    @sync_to_async
    def increment_connections(self):
        connections = cache.get(self.cache_key, 0)
        connections += 1
        cache.set(self.cache_key, connections)
        return connections

    @sync_to_async
    def decrement_connections(self):
        connections = cache.get(self.cache_key, 0)
        connections -= 1
        if connections < 0:
            connections = 0
        cache.set(self.cache_key, connections)
        return connections

    @database_sync_to_async
    def update_user_status(self, status):
        User.objects.filter(pk=self.user.pk).update(is_online=status)
