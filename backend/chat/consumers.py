


# Best Practices



import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message

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

        # Prepare message data
        message_data = {
            'sender': self.user.username,
            'sender_id': sender_id,
            'receiver': receiver_username,
            'receiver_id': receiver_id,
            'message': message
        }

        # # Send message to sender's group
        # await self.channel_layer.group_send(sender_group, {
        #     'type': 'chat_message',
        #     **message_data
        # })

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
            'message': event['message']
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









# add






# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from django.contrib.auth import get_user_model
# from .models import Message

# User = get_user_model()

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user = self.scope["user"]
#         if self.user.is_authenticated:
#             # Create a unique group name for the user based on their user ID
#             self.room_group_name = f'chat_{self.user.id}'

#             # Add user to their own group
#             await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#             await self.accept()  # Accept the WebSocket connection
#         else:
#             await self.close()  # Close connection if authentication fails

#     async def disconnect(self, close_code):
#         # Leave the group on disconnect
#         if hasattr(self, 'room_group_name'):
#             await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     async def receive(self, text_data):
#         data = json.loads(text_data)  # Parse incoming JSON data
#         print('data => ', data)
#         message = data.get('message')
#         receiver_username = data.get('receiver')
        
#         # Fetch the receiver by username
#         receiver = await self.get_user_by_username(receiver_username)

#         print('receiver is => ', receiver)

#         if receiver:
#             # Save the message to the database
#             await self.save_message(self.user, receiver, message)

#             # Broadcast the message to both the sender's and receiver's group
#             sender_group = f'chat_{self.user.id}'
#             receiver_group = f'chat_{receiver.id}'

#             # Send message to the sender's WebSocket group
#             await self.channel_layer.group_send(
#                 sender_group,
#                 {
#                     'type': 'chat_message',
#                     'sender': self.user.username,
#                     'sender_id': self.user.id,
#                     'receiver': receiver.username,
#                     'receiver_id': receiver.id,
#                     'message': message
#                 }
#             )

#             # Send message to the receiver's WebSocket group
#             await self.channel_layer.group_send(
#                 receiver_group,
#                 {
#                     'type': 'chat_message',
#                     'sender': self.user.username,
#                     'sender_id': self.user.id,
#                     'receiver': receiver.username,
#                     'receiver_id': receiver.id,
#                     'message': message
#                 }
#             )

    
#     async def chat_message(self, event):
#          # Check if the user is not the sender
#         if self.user.id != event['sender_id']:
#             # Send the message to the WebSocket including sender and receiver IDs
#             await self.send(text_data=json.dumps({
#                 'sender': event['sender'],
#                 'sender_id': event['sender_id'],  # Include sender ID
#                 'receiver': event['receiver'],
#                 'receiver_id': event['receiver_id'],  # Include receiver ID
#                 'message': event['message']
#             }))

#     @database_sync_to_async
#     def get_user_by_username(self, username):
#         try:
#             return User.objects.get(username=username)
#         except User.DoesNotExist:
#             return None

#     @database_sync_to_async
#     def save_message(self, sender, receiver, message):
#         return Message.objects.create(sender=sender, receiver=receiver, message=message)





# add










# old 




# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from django.contrib.auth import get_user_model
# from .models import Message




# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user = self.scope["user"]
#         self.receiver_id = self.scope["url_route"]["kwargs"]["receiver_id"]
#         self.receiver = await self.get_user(self.receiver_id)
#         print("this is the receiver => " , self.receiver)
#         print("this is the username receiver => " , self.receiver.username)
#         print("this is self.user => " , self.user)

#         if self.user.is_authenticated and self.receiver:
#             # Create a unique group name based on the two users
#             self.room_group_name = f'chat_{self.user.id}_{self.receiver_id}'

#             # Add both users to the group
#             await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#             await self.accept()  # Accept the WebSocket connection
#         else:
#             await self.close()  # Close connection if authentication fails

#     async def disconnect(self, close_code):
#         # Leave the group on disconnect
#         if self.room_group_name:
#             await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
#         print("weebb in backend chat disconnect")

#     async def receive(self, text_data):
#         print("ther is a new message")
#         data = json.loads(text_data)  # Parse incoming JSON data
#         print('receive in the backend data from the frent =>', data)

#         # Extract sender, receiver, and text from the data
#         # sender_id = data.get('sender')
#         # receiver_id = data.get('receiver')
#         message = data.get('message')
#         receiver = data.get('receiver')
#         sender = data.get('sender')

#         # Save the message to the database
#         await self.save_message(self.user, self.receiver, message)
#         # await self.save_message(sender, receiver, message)

#         # Send the message to the group (WebSocket clients)
#         await self.channel_layer.group_send(
#             # self.room_group_name,
#             # {
#             #     'type': 'chat_message',
#             #     'message': message,  # Send the message content
#             #     'sender': sender,  # Include the sender's username
#             #     'receiver': receiver # Include the receiver's username
#             #     # 'sender': receiver_id,  # Include the sender's username
#             # }
#             self.room_group_name,
#             {
#                 'type': 'chat_message',
#                 'message': message,  # Send the message content
#                 'sender': self.user.username,  # Include the sender's username
#                 'receiver': self.receiver.username # Include the receiver's username
#                 # 'sender': receiver_id,  # Include the sender's username
#             }
#         )

#     async def chat_message(self, event):
#         # Send the message to WebSocket clients
#         await self.send(text_data=json.dumps({
#             'message': event['message'],
#             'sender': event['sender'],
#             'receiver': event['receiver'],
#         }))
#         print('backend self.send', event)

#     @database_sync_to_async
#     def get_user(self, user_id):
#         try:
#             return User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             return None

#     @database_sync_to_async
#     def save_message(self, sender, receiver, message):
#         Message.objects.create(sender=sender, receiver=receiver, message=message)


# old