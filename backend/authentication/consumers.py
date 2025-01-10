import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .redis_connection import redis_conn
from .models import Friendship, Notification, CustomUser
from django.db.models import Q
from .serializers import NotificationSerializer
from django.db import transaction, DatabaseError
from asgiref.sync import sync_to_async
import time
from rest_framework.test import APIRequestFactory
from authentication.views import BlockFriendshipView  # Update with your actual import path
from authentication.views import RemoveBlockedFriend  # Update with your actual import path
from authentication.views import RemoveFriend  # Update with your actual import path
# from .notif_consumers import notification_consumers 

from rest_framework.response import Response
from rest_framework import status


User = get_user_model()
logger = logging.getLogger(__name__)

class BaseConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.USER_STATUS_GROUP = 'users_status'
		self.user_windows = None
		self.user = None
		self.user_data = None
		# self.channel_name = None

	async def connect(self):

		self.user = self.scope.get("user")
		if self.user and self.user.is_authenticated:
			await self.accept()
			self.user_windows = f"user_{self.user.id}"
			self.user_data = UserSerializer(self.user).data
			await self.add_user_to_groups()

	async def disconnect(self, close_code):

		if self.user and self.user.is_authenticated:
			await self.remove_user_from_groups()
			await self.close()

	async def receive(self, text_data):

		text_data_json = json.loads(text_data)
		user = text_data_json.get('user')
		logout = text_data_json.get('logout')
		online = text_data_json.get('online')



		if user:
			self.user = await database_sync_to_async(User.objects.get)(username=user)
			self.user_data = UserSerializer(self.user).data
		# Handle logout event
		if logout and self.user.is_authenticated:
			await self.untrack_user_connection()
			self.scope['user'] = None  # Set the scope user to None

			await self.close()

		# Handle online event
		elif online and self.user.is_authenticated:
			await self.track_user_connection()

	async def add_user_to_groups(self):
		try:
			await self.channel_layer.group_add(self.user_windows, self.channel_name)
			await self.channel_layer.group_add(self.USER_STATUS_GROUP, self.channel_name)
			await self.track_user_connection()
		except Exception as e:
			logger.error(f"\nError during connection: {e}\n")

	async def track_user_connection(self):
		user_id = str(self.user.id)
		channel_name = self.channel_name

		redis_conn.sadd(user_id, channel_name) # Add the user's channel name to the set
		if redis_conn.scard(user_id) == 1:

			await self.save_user_status("online")
			await self.broadcast_online_status(self.user_data, "online")

	@database_sync_to_async
	def save_user_status(self, status):
		current_user = User.objects.get(id=self.user.id)
		current_user.status = status
		current_user.save()

	async def untrack_user_connection(self):

		user_id = str(self.user.id)
		channel_name = self.channel_name

		redis_conn.srem(user_id, channel_name)
		if redis_conn.scard(user_id) == 0:

			await self.broadcast_online_status(self.user_data, "offline")
			await self.save_user_status("offline")

	async def remove_user_from_groups(self):
		try:
			if self.user_windows:
				await self.channel_layer.group_discard(self.user_windows, self.channel_name)
			if self.USER_STATUS_GROUP:
				await self.channel_layer.group_discard(self.USER_STATUS_GROUP, self.channel_name)
			await self.untrack_user_connection()
		except Exception as e:
			logger.error(f"\nError during disconnection: {e}\n")

	async def broadcast_online_status(self, user_data, status):
		try:
			await self.channel_layer.group_send(self.USER_STATUS_GROUP,
				{
					"type": "user_status_change",
					'id': user_data['id'],
					"username": user_data['username'],
					"avatar": user_data['avatar'],
					"status": status,
				}
			)
		except Exception as e:
			logger.error(f"\nError broadcasting status: {e}\n")

	async def user_status_change(self, event):
		try:
			if event['id'] != self.user.id:
				await self.send(text_data=json.dumps({
					"type": "user_status_change",
					"username": event['username'],
					"avatar": event['avatar'],
					"status": event['status'],
				}))
		except Exception as e:
			logger.error(f"\nError sending user status change: {e}\n")

class NotificationConsumer(BaseConsumer):
	async def connect(self):
		await super().connect()

	async def disconnect(self, close_code):
		await super().disconnect(close_code)

	# ************************ for friend request ************************
	async def send_notification_alert(self, user_id, notification):
		"""Send the notification to the user's group."""
		group_name = f"user_{user_id}"

		try:
			await self.channel_layer.group_send(
				group_name,
				{
					'type': notification.get('type'),
					**notification  
				}
			)
		except Exception as e:
			logger.error(f"\nError sending notification alert: {e}\n")

# ************************ handlers for notificatins ************************

	async def block_user_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'block_user',
			'success': event.get('success'),
			'blocked': event.get('blocked'),
			'error': event.get('error'),
			'message': event.get('message'),
			'to_user_id': event.get('to_user_id'),
		}))
	
	async def remove_block_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'remove_block',
			'success': event.get('success'),
			'to_user_id': event.get('to_user_id'),
		}))
	
	async def remove_friend_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'remove_friend',
			'success': event.get('success'),
			'to_user_id': event.get('to_user_id'),
		}))

	async def accept_game_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'accept_game',
			'success': event.get('success'), 
			**event.get('notification') 
		}))
    
	async def round_notification(self, event):
		await self.send(text_data=json.dumps({
			'type': 'round_game',  
			'success': event.get('success'),
			**event.get('notification')
		}))

	async def invite_to_game_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'invite_to_game',
			'success': event.get('success'),
			**event.get('notification')
		}))

	async def friend_request_notif(self, event):

		try:
			await self.send(text_data=json.dumps({
				'type': 'send_friend_request',
				'success': event.get('success'),
				**event.get('notification')
			}))
		except Exception as e:
			logger.error(f"Error handling friend_request_received: {e}")

	async def accept_request_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'accept_friend_request',
			'success': event.get('success'),
			'to_user_id': event.get('to_user_id'),
			**event.get('notification')
		}))

	async def accepted_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'accepted_done',
			'success': event.get('success'),
			'to_user_id': event.get('to_user_id'),
			**event.get('notification')
		}))

	async def reject_request_notif(self, event):

		await self.send(text_data=json.dumps({
			'type': 'reject_friend_request',
			'success': event.get('success'),
			'user_id': event.get('user_id'),
		}))
# ************************ END handlers for notificatins ************************ #

	async def handle_event(self, data):

		message_type = data.get('type')
		if message_type == 'send_friend_request':
			await self.handle_friend_request(data)
		elif message_type == 'invite_to_game':
			await self.handle_invite_to_game(data)
		elif message_type == 'accept_friend_request':
			await self.handle_accept_request(data)
		elif message_type == 'accept_game':
			await self.handle_accept_game(data)
		elif message_type == 'reject_friend_request':
			await self.handle_reject_request(data)
		elif message_type == 'user_status_online':
			await self.track_user_connection()
		elif message_type == 'user_status_offline':
			await self.untrack_user_connection()
		elif message_type == 'block_user':
			await self.block_user(data)
		elif message_type == 'remove_block':
			await self.remove_block(data)
		elif message_type == 'remove_friend':
			await self.remove_friend(data)
		


	async def remove_friend(self, data):
		user_id = data.get('to_user_id')
		try:
			@database_sync_to_async
			def get_friendship():
				return Friendship.objects.filter(
					Q(sender_id=self.user.id, receiver_id=user_id) | 
					Q(sender_id=user_id, receiver_id=self.user.id)
				).first()

			# Get friendship
			friendship = await get_friendship()

			if not friendship:
				await self.send_notification_alert(self.user.id, {
					'type': 'remove_friend_notif',
					'to_user_id': self.user.id,
					'success': False,
					'message': 'Friendship not found'
				})
				return

			# Check if friendship is in accepted status
			if friendship.status != 'accepted':
				await self.send_notification_alert(self.user.id, {
					'type': 'remove_friend_notif',
					'to_user_id': self.user.id,
					'success': False,
					'message': 'This request has already been processed'
				})
				return

			@database_sync_to_async
			def delete_friendship():
				friendship.delete()  # This will also delete the reciprocal friendship due to your model's delete method

			# Delete the friendship
			await delete_friendship()

			# Send notification to removed friend
			await self.send_notification_alert(user_id, {
				'type': 'remove_friend_notif',
				'to_user_id': self.user.id,
				'success': True,
				'message': 'You have been removed from friends list'
			})
			
			# Send confirmation to user who removed
			await self.send_notification_alert(self.user.id, {
				'type': 'remove_friend_notif',
				'to_user_id': user_id,
				'success': True,
				'message': 'Friend removed from friends list'
			})

		except Exception as e:
			logger.error(f"\nError removing friend: {e}\n")
			await self.send_notification_alert(self.user.id, {
				'type': 'remove_friend_notif',
				'to_user_id': self.user.id,
				'success': False,
				'error': str(e)
			})


	async def remove_block(self, data):
		user_id = data.get('to_user_id')
		try:
			@database_sync_to_async
			def get_blocking_friendship():
				return Friendship.objects.filter(
					Q(sender_id=self.user.id, receiver_id=user_id, status='blocking') |
					Q(sender_id=user_id, receiver_id=self.user.id, status='blocked') |
					Q(sender_id=self.user.id, receiver_id=user_id, status='blocked') |
					Q(sender_id=user_id, receiver_id=self.user.id, status='blocking')
				).first()

			# Get the blocking friendship
			friendship = await get_blocking_friendship()

			if not friendship:
				await self.send_notification_alert(self.user.id, {
					'type': 'remove_block_notif',
					'to_user_id': self.user.id,
					'success': False,
					'message': 'No blocking relationship found'
				})
				return

			@database_sync_to_async
			def accept_friendship():
				friendship.accept()  # This will handle both statuses and reciprocal relationship

			# Execute the unblocking
			await accept_friendship()

			# Send notifications to both users
			await self.send_notification_alert(user_id, {
				'type': 'remove_block_notif',
				'to_user_id': self.user.id,
				'success': True,
				'message': 'Block removed successfully, friendship accepted'
			})
			
			await self.send_notification_alert(self.user.id, {
				'type': 'remove_block_notif',
				'to_user_id': user_id,
				'success': True,
				'message': 'Block removed successfully, friendship accepted'
			})

		except Exception as e:
			logger.error(f"\nError unblocking user: {e}\n")
			await self.send_notification_alert(self.user.id, {
				'type': 'remove_block_notif',
				'to_user_id': self.user.id,
				'success': False,
				'error': str(e)
			})


	async def block_user(self, data):
		user_id = data.get('to_user_id')
		try:
			@database_sync_to_async
			def get_friendship():
				return Friendship.objects.filter(
					Q(sender=self.user, receiver_id=user_id) |
					Q(sender_id=user_id, receiver=self.user)
				).first()

			# Get friendship using the wrapped function
			friendship = await get_friendship()

			if not friendship:
				await self.send_notification_alert(self.user.id, {
					'type': 'block_user_notif',
					'success': False,
					'message': 'Cannot block: No friendship exists between users',
					'to_user_id': self.user.id
				})
				return

			# If already blocking/blocked, don't do anything
			if friendship.status in ['blocking', 'blocked']:
				await self.send_notification_alert(self.user.id, {
					'type': 'block_user_notif',
					'success': False,
					'message': 'Already blocked',
					'to_user_id': self.user.id
				})
				return

			@database_sync_to_async
			def block_friendship():
				# If user is receiver, swap positions
				if friendship.sender != self.user:
					# Store the users
					sender = friendship.sender
					receiver = friendship.receiver
					# Delete current friendship
					friendship.delete()
					# Create new friendship with correct positions
					new_friendship = Friendship.objects.create(
						sender=receiver,
						receiver=sender
					)
					new_friendship.block()  # This will handle status and received_status
					return new_friendship
				else:
					friendship.block()  # This will handle status and received_status
					return friendship

			# Execute the blocking
			updated_friendship = await block_friendship()

			# Send notifications
			await self.send_notification_alert(user_id, {
				'type': 'block_user_notif',
				'success': True,
				'message': 'You have been blocked',
				'blocked': True,
				'to_user_id': self.user.id
			})
			
			await self.send_notification_alert(self.user.id, {
				'type': 'block_user_notif',
				'success': True,
				'message': 'User blocked successfully',
				'to_user_id': user_id
			})

		except Exception as e:
			logger.error(f"\nError blocking user: {e}\n")
			await self.send_notification_alert(self.user.id, {
				'type': 'block_user_notif',
				'success': False,
				'error': str(e),
				'to_user_id': self.user.id
			})



	async def handle_accept_game(self, data):

		to_user_id = data.get('to_user_id')
		try:
			# Use sync_to_async to run synchronous code in a separate thread
			notif = await database_sync_to_async(Notification.objects.create)(
				sender=self.user,
				receiver= await database_sync_to_async(User.objects.get)(id=to_user_id),
				message=f"{self.user} accepted your game invite",
				notif_type='game',
				notif_status='accepted'
			)
			notif_data =  NotificationSerializer(notif).data
			await self.send_notification_alert(to_user_id, {
				'type': 'accept_game_notif',
				'success': True,
				'notification': notif_data,
			})
		except Exception as e:
			logger.error(f"\nError sending game invite: {e}\n")

	async def round_notifs(self, data):

		to_user_id = data.get('to_user_id')
		from_user_id = data.get('from_user_id')  
		message = data.get('message')
		try:
			# Save the notification in the database
			notif = await database_sync_to_async(Notification.objects.create)(
				sender= await database_sync_to_async(User.objects.get)(id=from_user_id),
				receiver= await database_sync_to_async(User.objects.get)(id=to_user_id),
				message=message,
				notif_type='round_game',
				notif_status='pending',
			)

			notif_data = NotificationSerializer(notif).data

			await self.send_notification_alert(to_user_id, {
				'type': 'round_notification',
				'success': True,
				'notification': notif_data,
			})
		except Exception as e:
			logger.error(f"\nError sending game invite: {e}\n")

	async def handle_invite_to_game(self, data): 

		to_user_id = data.get('to_user_id')
		try:
			# Use sync_to_async to run synchronous code in a separate thread
			notif = await database_sync_to_async(Notification.objects.create)(
				sender=self.user,
				receiver= await database_sync_to_async(User.objects.get)(id=to_user_id),
				message=f"{self.user} invited you to a game",
				notif_type='game',
				notif_status='pending'
			)
			notif_data =  NotificationSerializer(notif).data
			user_id = self.user.id
			friend_id = to_user_id
			friendship = await sync_to_async(lambda: Friendship.objects.filter(
							Q(sender_id=user_id, receiver_id=friend_id) |
							Q(sender_id=friend_id, receiver_id=user_id)
						).first())()
			if friendship and friendship.status != 'accepted':
				return
			await self.send_notification_alert(to_user_id, {
				'type': 'invite_to_game_notif',
				'success': True,
				'notification': notif_data,
			})
		except Exception as e:
			logger.error(f"\nError sending game invite: {e}\n")

	async def handle_friend_request(self, data):
		to_user_id = data.get('to_user_id')

		success, message, notif = await self.save_friend_request(to_user_id)
		notif_data = NotificationSerializer(notif).data
		if (success):
			await self.send_notification_alert(to_user_id, {
				'type': 'friend_request_notif',
				'success': success,
				'notification': notif_data,
			})

	async def handle_accept_request(self, data):
		to_user_id = data.get('to_user_id')

		success, message, notif = await self.accept_friend_request(to_user_id)
		notif_data = NotificationSerializer(notif).data
		if (success):
			await self.send_notification_alert(self.user.id, {
				'type': 'accepted_notif',
				'success': success,
				'to_user_id': to_user_id,
				'notification': notif_data,
			})

			await self.send_notification_alert(to_user_id, {
				'type': 'accept_request_notif',
				'success': success,
				'to_user_id': self.user.id,
				'notification': notif_data,
			})

	async def handle_reject_request(self, data):
		rejected_user_id = data.get('to_user_id')

		await self.send_notification_alert(rejected_user_id, {
			'type': 'reject_request_notif',
			'success': True,
			'to_user_id': self.user.id,
		})

	async def receive(self, text_data):

		await super().receive(text_data)
		data = json.loads(text_data)
		await self.handle_event(data)

	@database_sync_to_async
	def save_friend_request(self, to_user_id):
		try:
			to_user = User.objects.get(id=to_user_id)
			#check if the friendship already exists
			friendship = Friendship.objects.filter(
				Q(sender=self.user, receiver=to_user) | 
				Q(sender=to_user, receiver=self.user)
			).first()
			if friendship:
				return False, "Friend request already sent", None
			notif = Notification.objects.create(
				sender=self.user,
				receiver=to_user,
				message=f"{self.user} send to you friend request",
				notif_type='friend',
				notif_status='pending'
			)
			return True, "Friend request sent successfully", notif
		except Exception as e:
			logger.error(f"\nError sending friend request: {e}\n")
			return False, f"Error sending friend request, reason :: {str(e)}", None

	@database_sync_to_async
	def accept_friend_request(self, user_id):
		max_retries = 5
		for attempt in range(max_retries):
			try:
				with transaction.atomic():
					to_user = User.objects.select_for_update().get(id=user_id)
					notif = Notification.objects.create(
						sender=self.user,
						receiver=to_user,
						message=f"{self.user} accepted your friend request",
						notif_type='friend',
						notif_status='accepted'
					)
					notif.accept() # for creating reciprocal friendship
					return True, "Friend request accepted", notif
			except Friendship.DoesNotExist:
				return False, "Friend request not found.", None
			except DatabaseError as e:
				if 'database is locked' in str(e):
					logger.warning(f"\nDatabase is locked, retrying {attempt + 1}/{max_retries}\n")
					time.sleep(1)  # Wait for a second before retrying
					continue
				else:
					logger.error(f"\nError Accepting friend request: {e}\n")
					return False, f"Error Accepting Friend request, reason :: {str(e)}", None
			except Exception as e:
				logger.error(f"\nError Accepting friend request: {e}\n")
				return False, f"Error Accepting Friend request, reason :: {str(e)}", None
		return False, "Error Accepting Friend request, database is locked after multiple retries", None
