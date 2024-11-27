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
        print('message received =>', message)
        receiver_username = data.get('receiver')
        mark_read = data.get('mark_read', False)  # Detect mark as read request

        # add conact
        contact_username = data.get('contact')  # Used for marking messages as read
        print('contact_username =>', contact_username)

        receiver = await self.get_user_by_username(receiver_username)
        print('receiver =>'  ,receiver)
        print('receiver_username =>' ,receiver_username)



        # if mark_read:
        #     print('we receive the mark_read from the frant')
        #     await self.mark_messages_as_read(receiver_username)
        #     return
        

        # Handle the message
        if message and receiver:
                await self.save_message(self.user, receiver, message)
                await self.send_message_to_groups(self.user.id, receiver.id, receiver_username, message)

        # Handle typing indication
        if 'typing' in data:
            typing_status = data['typing']
            await self.send_typing_indicator(self.user.id, receiver.id, self.user.username, receiver_username, typing_status)


    # async def mark_messages_as_read(self, friend_username):
    #     friend = await self.get_user_by_username(friend_username)
    #     if friend:
    #         await self.update_message_read_status(self.user, friend)
    #         await self.send_mark_read_status(friend.id, friend_username)

    # async def send_mark_read_status(self, friend_id, receiver_username):
    #     print('USE chat_mark_read TO RESPONCE TO HE FRANT  read_status in database')
    #      # Notify both sender and receiver that messages have been marked as read
    #     await self.channel_layer.group_send(
    #         f'{self.GROUP_PREFIX}{friend_id}',
    #         {
    #             'type': 'chat_mark_read',
    #             'receiver': receiver_username,
    #             'mark_read': True,
    #         }
    #     )
    #     await self.channel_layer.group_send(
    #         f'{self.GROUP_PREFIX}{self.user.id}',
    #         {
    #             'type': 'chat_mark_read',
    #             'receiver': receiver_username,
    #             'mark_read': True,
    #         }
    #     )

    # async def chat_mark_read(self, event):
    #     print('Send read status to WebSocket client')
    #     # Send read status to WebSocket client
    #     await self.send(text_data=json.dumps({
    #         'mark_read': event['mark_read'],
    #         'receiver': event['receiver'],
    #         # 'mark_read': True,
    #         # 'user': event['user'],
    #     }))


    # @database_sync_to_async
    # def update_message_read_status(self, user, friend):
    #     # Update message read status in the database
    #     Message.objects.filter(sender=friend, receiver=user, is_read=False).update(is_read=True)
    #     print('update read_status in database')



    # ******************************************************
    # *************** add conact *****************
    # ******************************************************

        # Handle marking messages as read
        if mark_read and contact_username:
            await self.mark_messages_as_read(contact_username)
            return


    async def mark_messages_as_read(self, contact_username):
        contact_user = await self.get_user_by_username(contact_username)
        if contact_user:
            # Update database to mark messages as read
            await self.update_message_read_status(self.user, contact_user)

            # Notify sender and receiver
            await self.send_mark_read_status(contact_user.id, contact_username)

    async def send_mark_read_status(self, contact_id, contact_username):
        # Notify both sender and receiver about the read status
        await self.channel_layer.group_send(
            f'{self.GROUP_PREFIX}{contact_id}',
            {
                'type': 'chat_mark_read',
                'contact': contact_username,
                'mark_read': True,
            }
        )
        await self.channel_layer.group_send(
            f'{self.GROUP_PREFIX}{self.user.id}',
            {
                'type': 'chat_mark_read',
                'contact': contact_username,
                'mark_read': True,
            }
        )

    async def chat_mark_read(self, event):
        # Send read status back to WebSocket clients
        print('--> event[contact]', event['contact'])
        await self.send(text_data=json.dumps({
            'mark_read': event['mark_read'],
            'contact': event['contact'],
        }))

    @database_sync_to_async
    def update_message_read_status(self, user, contact_user):
        # Update unread messages in the database
        Message.objects.filter(sender=contact_user, receiver=user, is_read=False).update(is_read=True)

    # ******************************************************
    # ***************** end of add contact *****************
    # ******************************************************


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

        # # # Send message to sender's group
        # await self.channel_layer.group_send(sender_group, {
        #     'type': 'chat_message',
        #     **message_data
        # })

        # # Send message to receiver's group only
        # await self.channel_layer.group_send(receiver_group, {
        #     'type': 'chat_message',
        #     **message_data
        # })


        # ****** test for evite the diplication ************
        # Send message to sender's group (excluding the receiver)
        if sender_id != receiver_id:
            print('print whatis goin here 11' )
            await self.channel_layer.group_send(sender_group, {
                'type': 'chat_message',
                **message_data
            })
        # Send message to receiver's group
        print('print whatis goin here 22' )
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
