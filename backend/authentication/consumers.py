from channels.generic.websocket import AsyncWebsocketConsumer
from authentication.serializers import UserSerializer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.core.cache import cache
import logging
import json

User = get_user_model()
# Set up logging
logger = logging.getLogger(__name__)

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    USER_STATUS_GROUP = 'users_status'
    CACHE_TIMEOUT = 60 * 60  # 1 hour cache timeout to avoid stale data

    async def connect(self):
        self.user = self.scope.get("user")
        self.user_data = UserSerializer(self.user).data
        
        if self.user and self.user.is_authenticated:
            self.cache_key = f"user_{self.user.id}_connections"
            
            try:
                # Add the user to their own connection group
                await self.channel_layer.group_add(
                    self.cache_key,
                    self.channel_name
                )
                # Add the user to the global status group
                await self.channel_layer.group_add(
                    self.USER_STATUS_GROUP,
                    self.channel_name
                )

                number_of_connections = await self.increment_connections()
                
                if number_of_connections == 1:
                    await self.send_status_to_user(True)
                    await self.update_user_status(True)
                    await self.broadcast_online_status(self.user_data, True)

                await self.accept()

            except Exception as e:
                logger.error(f"\nError during connection: {e}\n")
                await self.close()
        
        else:
            await self.close()

    async def disconnect(self, close_code):
        if self.user and self.user.is_authenticated:
            try:
                number_of_connections = await self.decrement_connections()
                
                if number_of_connections == 0:
                    await self.send_status_to_user(False)
                    await self.update_user_status(False)
                    await self.broadcast_online_status(self.user_data, False)

                await self.channel_layer.group_discard(
                    self.cache_key,
                    self.channel_name
                )
                await self.channel_layer.group_discard(
                    self.USER_STATUS_GROUP,
                    self.channel_name
                )

            except Exception as e:
                logger.error(f"\nError during disconnection: {e}\n")

    async def broadcast_online_status(self, user_data, status):
        try:
            await self.channel_layer.group_send(
                self.USER_STATUS_GROUP,
                {
                    "type": "user_status_change",
                    "status": status,
                    **user_data
                }
            )
        except Exception as e:
            logger.error(f"\nError broadcasting status: {e}\n")

    async def user_status_change(self, event):
            try:
                if event['id'] != self.user.id:
                    await self.send(text_data=json.dumps({
                        "type": "user_status_change",
                        "id": event['id'],
                        "username": event['username'],
                        "avatar": event['avatar'],
                        "status": event['status'],
                    }))
            except Exception as e:
                logger.error(f"\nError sending user status change: {e}\n")

    async def send_status_to_user(self, status):
        try:
            await self.send(text_data=json.dumps({
                "type": "friend_status",
                "status": 'online' if status else 'offline'
            }))
        except Exception as e:
            logger.error(f"\nError sending status to user: {e}\n")

    @sync_to_async
    def increment_connections(self):
        try:
            connections = cache.get(self.cache_key, 0)
            connections += 1
            cache.set(self.cache_key, connections, timeout=self.CACHE_TIMEOUT)
            return connections
        except Exception as e:
            logger.error(f"\nError incrementing connections: {e}\n")
            return 0

    @sync_to_async
    def decrement_connections(self):
        try:
            connections = cache.get(self.cache_key, 0)
            connections -= 1
            if connections < 0:
                connections = 0
            cache.set(self.cache_key, connections, timeout=self.CACHE_TIMEOUT)
            return connections
        except Exception as e:
            logger.error(f"\nError decrementing connections: {e}\n")
            return 0

    @database_sync_to_async
    def update_user_status(self, status):
        try:
            User.objects.filter(pk=self.user.pk).update(is_online=status)
        except Exception as e:
            logger.error(f"\nError updating user status in database: {e}\n")
