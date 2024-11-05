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

        # Handle the message
        if message:
            if receiver:
                await self.save_message(self.user, receiver, message)
                await self.send_message_to_groups(self.user.id, receiver.id, receiver_username, message)

        # Handle typing indication
        if 'typing' in data:
            typing_status = data['typing']
            await self.send_typing_indicator(self.user.id, receiver.id, self.user.username, receiver_username, typing_status)


    async def send_typing_indicator(self, sender_id, receiver_id, sender_username, receiver_username, typing_status):
        # Prepare typing indicator data
        typing_data = {
            'typing': typing_status,
            'sender': sender_username,
            'receiver': receiver_username,
        }
        # Send typing indicator to both the sender's and receiver's groups
        await self.channel_layer.group_send(
            f'{self.GROUP_PREFIX}{sender_id}',
            {
                'type': 'chat_typing',
                **typing_data
            }
        )
        await self.channel_layer.group_send(
            f'{self.GROUP_PREFIX}{receiver_id}',
            {
                'type': 'chat_typing',
                **typing_data
            }
        )

    async def chat_typing(self, event):
        # Send the typing status back to the WebSocket client
        await self.send(text_data=json.dumps({
            'typing': event['typing'],  # True or False
            'sender': event['sender'],
            'receiver': event['receiver'],
        }))
  

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
            'timestamp': timestamp
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
            'timestamp': event['timestamp'],
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



# *******************************

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from django.contrib.auth import get_user_model
# from django.utils import timezone  # Import timezone for timestamps
# from .models import Message

# User = get_user_model()

# class ChatConsumer(AsyncWebsocketConsumer):
#     GROUP_PREFIX = 'chat_'

#     async def connect(self):
#         self.user = self.scope["user"]
#         if self.user.is_authenticated:
#             self.room_group_name = f'{self.GROUP_PREFIX}{self.user.id}'
#             await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#             await self.accept()
#         else:
#             await self.close()

#     async def disconnect(self, close_code):
#         if hasattr(self, 'room_group_name'):
#             await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data.get('message')
#         receiver_username = data.get('receiver')

#         if receiver_username:
#             receiver = await self.get_user_by_username(receiver_username)
#         else:
#             receiver = None

#         # Handle message sending
#         if message and receiver:
#             await self.handle_message(message, receiver)

#         # Handle typing indication
#         if 'typing' in data and receiver:
#             await self.handle_typing_indicator(data['typing'], receiver)

#     async def handle_message(self, message, receiver):
#         """Save and send messages to the relevant groups."""
#         await self.save_message(self.user, receiver, message)
#         await self.send_message_to_groups(self.user, receiver, message)

#     async def handle_typing_indicator(self, typing_status, receiver):
#         """Send typing indicator to both sender and receiver groups."""
#         typing_data = {
#             'typing': typing_status,  # True or False
#             'sender': self.user.username,
#             'receiver': receiver.username,
#         }
#         await self.send_typing_to_groups(self.user.id, receiver.id, typing_data)

#     async def send_typing_to_groups(self, sender_id, receiver_id, typing_data):
#         """Send typing indicator to both the sender's and receiver's groups."""
#         await self.send_to_group(f'{self.GROUP_PREFIX}{sender_id}', 'chat_typing', typing_data)
#         await self.send_to_group(f'{self.GROUP_PREFIX}{receiver_id}', 'chat_typing', typing_data)

#     async def chat_typing(self, event):
#         """Send typing status back to the WebSocket client."""
#         await self.send_json({
#             'typing': event['typing'],
#             'sender': event['sender'],
#             'receiver': event['receiver'],
#         })

#     async def send_message_to_groups(self, sender, receiver, message):
#         """Send message data to both sender's and receiver's groups."""
#         message_data = self.format_message_data(sender, receiver, message)

#         # Send message to both sender's and receiver's groups
#         await self.send_to_group(f'{self.GROUP_PREFIX}{sender.id}', 'chat_message', message_data)
#         await self.send_to_group(f'{self.GROUP_PREFIX}{receiver.id}', 'chat_message', message_data)

#     async def chat_message(self, event):
#         """Send the message data back to the WebSocket client."""
#         await self.send_json(event)

#     async def send_to_group(self, group_name, event_type, data):
#         """Utility method to send data to a group."""
#         await self.channel_layer.group_send(group_name, {
#             'type': event_type,
#             **data
#         })

#     def format_message_data(self, sender, receiver, message):
#         """Format message data for consistent structure."""
#         return {
#             'sender': sender.username,
#             'sender_id': sender.id,
#             'receiver': receiver.username,
#             'receiver_id': receiver.id,
#             'message': message,
#             'timestamp': timezone.now().isoformat(),  # ISO format for easy parsing
#         }

#     @database_sync_to_async
#     def get_user_by_username(self, username):
#         """Fetch user by username, return None if not found."""
#         try:
#             return User.objects.get(username=username)
#         except User.DoesNotExist:
#             return None

#     @database_sync_to_async
#     def save_message(self, sender, receiver, message):
#         """Save the message to the database."""
#         return Message.objects.create(sender=sender, receiver=receiver, message=message)
