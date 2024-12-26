import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message
from authentication.models import Friendship
from django.db.models import Q
from asgiref.sync import sync_to_async
from django.utils import timezone  # Import timezone for getting the current time



User = get_user_model()

# Add logging
import logging
logger = logging.getLogger(__name__)


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
        mark_read = data.get('mark_read', False)  # Detect mark as read request

        # add conact
        contact_username = data.get('contact')  # Used for marking messages as read

        receiver = await self.get_user_by_username(receiver_username)

        # Handle the message
        if message and receiver:
            user_id = self.user.id
            friend_id = receiver.id
            
            friendship = await sync_to_async(lambda: Friendship.objects.filter(
                Q(sender_id=user_id, receiver_id=friend_id) |
                Q(sender_id=friend_id, receiver_id=user_id)
            ).first())()
            
            if friendship and friendship.status != 'accepted':
                return
            await self.save_message(self.user, receiver, message)
            await self.send_message_to_groups(self.user.id, receiver.id, receiver_username, message)

        # Handle typing indication
        if 'typing' in data:
            typing_status = data['typing']
            await self.send_typing_indicator(self.user.id, receiver.id, self.user.username, receiver_username, typing_status)

        # Handle marking messages as read
        if mark_read and contact_username:
            await self.mark_messages_as_read(contact_username)
            return


    async def mark_messages_as_read(self, contact_username):
        contact_user = await self.get_user_by_username(contact_username)
        if contact_user:
        # Check if there are unread messages before updating
            try:
                unread_messages_exist = await database_sync_to_async(
                    lambda: Message.objects.filter(sender=contact_user, receiver=self.user, is_read=False).exists()
                )()

                if unread_messages_exist:
                    await self.update_message_read_status(self.user, contact_user)
                    # Notify sender and receiver
                    await self.send_mark_read_status(contact_user.id, contact_username)
            except Exception as e:
                logger.error(f"Error marking messages as read: {e}")
        

    async def send_mark_read_status(self, contact_id, contact_username):

        user_data = {
        'id': self.user.id,
        'username': self.user.username,
        }

        # Notify both sender and receiver about the read status
        await self.channel_layer.group_send(
            f'{self.GROUP_PREFIX}{contact_id}',
            {
                'type': 'chat_mark_read',
                'contact': contact_username,
                'session_user': user_data,
                'mark_read': True,
            }
        )
        await self.channel_layer.group_send(
            f'{self.GROUP_PREFIX}{self.user.id}',
            {
                'type': 'chat_mark_read',
                'contact': contact_username,
                'session_user': user_data,
                'mark_read': True,
            }
        )

    async def chat_mark_read(self, event):
        # Send read status back to WebSocket clients
        await self.send(text_data=json.dumps({
            'mark_read': event['mark_read'],
            'contact': event['contact'],
            'session_user': event['session_user'],
        }))

    @database_sync_to_async
    def update_message_read_status(self, user, contact_user):
        # Update unread messages in the database
        Message.objects.filter(sender=contact_user, receiver=user, is_read=False).update(is_read=True)


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

        # Calculate unread count for receiver
        unread_count = await self.get_unread_count(receiver_id)

        # Prepare message data
        message_data = {
            'sender': self.user.username,
            'sender_id': sender_id,
            'receiver': receiver_username,
            'receiver_id': receiver_id,
            'message': message,
            'timestamp': timestamp,
            'unread_count': unread_count
        }

        # ****** test for evite the diplication ************
        # Send message to sender's group (excluding the receiver)
        if sender_id != receiver_id:
            await self.channel_layer.group_send(sender_group, {
                'type': 'chat_message',
                **message_data
            })
        # Send message to receiver's group
        await self.channel_layer.group_send(receiver_group, {
            'type': 'chat_message',
            **message_data
        })
        # ****** end test for evite the diplication ************


    async def chat_message(self, event):
        print('Send message using chat_message methode' )
        await self.send(text_data=json.dumps({
            'sender': event['sender'],
            'sender_id': event['sender_id'],
            'receiver': event['receiver'],
            'receiver_id': event['receiver_id'],
            'message': event['message'],
            'timestamp': event['timestamp'],
            'unread_count': event.get('unread_count', 0),
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
    
    @database_sync_to_async
    def get_unread_count(self, user_id):
        # Get count of unread messages for a specific user
        return Message.objects.filter(receiver_id=user_id, is_read=False).count()

