


# Best Practices



import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message

from django.utils import timezone  # Import timezone for getting the current time



User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    GROUP_PREFIX = 'chat_'

    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.room_group_name = f'{self.GROUP_PREFIX}{self.user.id}'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        receiver_username = data.get('receiver')

        receiver = await self.get_user_by_username(receiver_username)

        if receiver:
            await self.save_message(self.user, receiver, message)
            await self.send_message_to_groups(self.user.id, receiver.id, receiver_username, message)

    async def send_message_to_groups(self, sender_id, receiver_id, receiver_username, message):
        sender_group = f'{self.GROUP_PREFIX}{sender_id}'
        receiver_group = f'{self.GROUP_PREFIX}{receiver_id}'


        # Get the current timestamp
        timestamp = timezone.now().isoformat()  # ISO format for easy parsing in JS

        # Prepare message data
        message_data = {
            'sender': self.user.username,
            'sender_id': sender_id,
            'receiver': receiver_username,
            'receiver_id': receiver_id,
            'message': message,
            'timestamp': timestamp  # Include the timestamp
        }

        # # Send message to sender's group
        await self.channel_layer.group_send(sender_group, {
            'type': 'chat_message',
            **message_data
        })

        # Send message to receiver's group only
        await self.channel_layer.group_send(receiver_group, {
            'type': 'chat_message',
            **message_data
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'sender': event['sender'],
            'sender_id': event['sender_id'],
            'receiver': event['receiver'],
            'receiver_id': event['receiver_id'],
            'message': event['message'],
            'timestamp': event['timestamp'],  # Send the timestamp
        }))

    @database_sync_to_async
    def get_user_by_username(self, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        return Message.objects.create(sender=sender, receiver=receiver, message=message)







# Best Practices
