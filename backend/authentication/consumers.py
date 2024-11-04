import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .redis_connection import redis_conn
from .models import Friendship, Notification
from django.db.models import Q

User = get_user_model()
logger = logging.getLogger(__name__)

class BaseConsumer(AsyncWebsocketConsumer):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.USER_STATUS_GROUP = 'users_status'
		self.user_windows = None
		self.user = None
		self.user_data = None


	async def connect(self):
		print("\n CONNECTED\n")
		await self.accept()
		self.user = self.scope.get("user")
		if self.user and self.user.is_authenticated:
			self.user_windows = f"user_{self.user.id}"
			self.user_data = UserSerializer(self.user).data
			await self.add_user_to_groups()

	async def disconnect(self, close_code):
		print("\n DISCONNECT\n")
		if self.user and self.user.is_authenticated:
			await self.remove_user_from_groups()
			await self.close()

	async def receive(self, text_data):
		print("\n RECEIVED\n")
		text_data_json = json.loads(text_data)
		user = text_data_json.get('user')
		logout = text_data_json.get('logout')
		online = text_data_json.get('online')

		print(f"data Received :: {text_data_json}\n")

		if user:
			self.user = await database_sync_to_async(User.objects.get)(username=user)
			self.user_data = UserSerializer(self.user).data
		# Handle logout event
		if logout and self.user.is_authenticated:
			await self.untrack_user_connection()

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

		redis_conn.sadd(user_id, channel_name)
		if redis_conn.scard(user_id) == 1:
			print(f"\n broadcasting online when login: {self.user}\n")
			await self.save_user_status("online")
			await self.broadcast_online_status(self.user_data, "online")

	@database_sync_to_async
	def save_user_status(self, status):
		current_user = User.objects.get(id=self.user.id)
		current_user.status = status
		current_user.save()

	async def untrack_user_connection(self):
		print(f"untrack_user_connection: {self.user}")
		user_id = str(self.user.id)
		channel_name = self.channel_name

		redis_conn.srem(user_id, channel_name)
		if redis_conn.scard(user_id) == 0:
			print(f"\n broadcasting offline when logout: {self.user}\n")
			await self.broadcast_online_status(self.user_data, "offline")
			await self.save_user_status("offline")

	async def remove_user_from_groups(self):
		try:
			await self.channel_layer.group_discard(self.user_windows, self.channel_name)
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

	# Handler for friend_request_received event
	async def friend_request_notif(self, event):
		try:
			print(f"\nfriend_request_notif: {event}\n")
			await self.send(text_data=json.dumps({
					'id' : event.get('id'),
					'type': 'send_friend_request',
					'to_user_id': event.get('to_user_id'),
					'username': event.get('username'),
					'success': event.get('success'),
					'avatar': event.get('avatar'),
					'message': event.get('message'),
					'notif_status' : "pending"
			}))
		except Exception as e:
			logger.error(f"Error handling friend_request_received: {e}")

	# Handler for accept_friend_request event
	async def accept_request_notif(self, event):
		await self.send(text_data=json.dumps({
			'id' : event.get('id'),
			'type': 'accept_friend_request',
			'success': event.get('success'),
			'message': event.get('message'),
			'username': event.get('username'),
			'user_id': event.get('user_id'),
			'avatar': event.get('avatar'),
			'notif_status': "accepted"
		}))

	# ************************ for rejecting friend request ************************
	async def reject_request_notif(self, event):
		print(f"\nreject_request_notif: {event}\n")
		await self.send(text_data=json.dumps({
			'type': 'reject_friend_request',
			'success': event.get('success'),
			'user_id': event.get('user_id'),
		}))

	async def handle_event(self, data):
		message_type = data.get('type')
		if message_type == 'send_friend_request':
			await self.handle_friend_request(data)
		elif message_type == 'accept_friend_request':
			await self.handle_accept_request(data)
		elif message_type == 'reject_friend_request':
			await self.handle_reject_request(data)
		elif message_type == 'user_status_online':
			await self.track_user_connection()
		elif message_type == 'user_status_offline':
			await self.untrack_user_connection()

	async def handle_friend_request(self, data):
		to_user_id = data.get('to_user_id')
		print(f"\nsend friend request to {to_user_id}")
		success, message, notif_id = await self.save_friend_request(to_user_id)
		await self.send_notification_alert(to_user_id, {
			'type': 'friend_request_notif',
			'id': notif_id,
			'success': success,
			'message': message,
			'to_user_id': self.user.id,
			'username': self.user_data['username'],
			'avatar': self.user_data['avatar'],
		})

	async def handle_accept_request(self, data):
		to_user_id = data.get('to_user_id')
		print(f"\naccept friend request from {to_user_id}")
		success, message, notif_id = await self.accept_friend_request(to_user_id)
		await self.send_notification_alert(to_user_id, {
			'type': 'accept_request_notif',
			'success': success,
			'message': message,
			'username': self.user_data['username'],
			'to_user_id': self.user.id,
			'id': notif_id,
			'avatar': self.user_data['avatar']
		})

	async def handle_reject_request(self, data):
		rejected_user_id = data.get('to_user_id')
		print(f"\nhandle reject request from {rejected_user_id}")
		reject_status = await self.reject_friend_request(rejected_user_id)
		await self.send_notification_alert(rejected_user_id, {
			'type': 'reject_request_notif',
			'success': reject_status,
			'user_id': self.user.id,
		})

	async def receive(self, text_data):
		await super().receive(text_data)
		data = json.loads(text_data)
		await self.handle_event(data)

	@database_sync_to_async
	def save_friend_request(self, to_user_id):
		try:
			to_user = User.objects.get(id=to_user_id)
			friend_request, created = Friendship.objects.get_or_create(sender=self.user, receiver=to_user, status='pending')
			if created:
				notif = Notification.objects.create(
					sender=self.user,
					receiver=to_user,
					message=f"{self.user} send to you friend request",
					notif_type='friend',
					notif_status='pending'
				)
				notif_id = notif.id
				return True, "Friend request sent successfully", notif_id
			elif friend_request.status == 'pending':
				logger.error(f"\nFriend request already sent\n")
				return False, "Friend request already sent", None
			else:
				return False, "Friend request already processed", None
		except Exception as e:
			logger.error(f"\nError sending friend request: {e}\n")
			return False, f"Error sending friend request, reason :: {str(e)}", None

	@database_sync_to_async
	def accept_friend_request(self, user_id):
		try:
			sender = User.objects.get(id=user_id)
			friend_request = Friendship.objects.get(
					Q(sender=sender, receiver=self.user) | Q(sender=self.user, receiver=sender)
			)

			if friend_request.status == 'pending':
					friend_request.status = 'accepted'
					friend_request.save()

					try:
						Friendship.objects.get(sender=self.user, receiver=sender)
					except Friendship.DoesNotExist:
						Friendship.objects.create(sender=self.user, receiver=sender, status='accepted')

					notif = Notification.objects.create(
						sender=self.user,
						receiver=sender,
						message=f"{sender} accepted your friend request",
						notif_type='friend',
						notif_status='accepted'
					)
					notif_id = notif.id
					logger.info(f"\nFriend request accepted 🍸\n")
					return True, "Friend request accepted" , notif_id
			else:
				return False, "Friend request already processed", None

		except Friendship.DoesNotExist:
			return False, "Friend request not found.", None
		except Exception as e:
			logger.error(f"\nError Accepting friend request: {e}\n")
			return False, f"Error Accepting Friend request, reason :: {str(e)}", None

	@database_sync_to_async
	def reject_friend_request(self, rejected_user_id):
		try:
			rejected_user = User.objects.get(id=rejected_user_id)
			friend_request = Friendship.objects.filter(
					Q(sender=rejected_user, receiver=self.user) | 
					Q(sender=self.user, receiver=rejected_user),
					status='pending'
			).first()

			if friend_request:
					friend_request.delete()
					logger.info(f"\nFriend request rejected\n")
					return True
			else:
					logger.warning(f"No pending friend request found between {self.user.username} and {rejected_user_id}")
					return False
		except User.DoesNotExist:
			logger.error(f"User with id {rejected_user_id} does not exist")
			return False
		except Exception as e:
			logger.error(f"Error rejecting friend request: {e}")
			return False

# Sure, let's break down the flow of sending notifications to users using Django Channels and channels_redis.

# Overview
# Django Channels extends Django to handle WebSockets, HTTP2, and other protocols. channels_redis is a Redis-backed channel layer that allows Django Channels to manage WebSocket connections and send messages between them.

# Key Components
# WebSocket Consumer: Handles WebSocket connections and messages.
# Channel Layer: Manages communication between different consumers using Redis.
# Groups: Allows grouping of channels to send messages to multiple consumers.
# Flow of Sending Notifications
# WebSocket Connection:

# When a user connects to the WebSocket, the connect method of the NotificationConsumer is called.
# The user is added to a group named after their user ID using channel_layer.group_add.
# Handling Events:

# The receive method handles incoming WebSocket messages.
# Based on the message type, different methods are called to handle specific events (e.g., friend request, accept request).
# Sending Notifications:

# When an event occurs (e.g., a friend request is sent), the send_notification_alert method is called.
# This method uses channel_layer.group_send to send a message to the user's group.
# Receiving Notifications:

# The user's WebSocket connection receives the message via a handler method (e.g., friend_request_notif).
# The handler method sends the notification to the user's WebSocket client.
# Example Flow
# User A sends a friend request to User B:

# User A's client sends a WebSocket message to the server.
# The receive method of NotificationConsumer processes the message and calls handle_friend_request.
# Handle Friend Request:

# handle_friend_request saves the friend request to the database.
# It then calls send_notification_alert to notify User B.
# Send Notification Alert:

# send_notification_alert uses channel_layer.group_send to send a message to User B's group.
# User B Receives Notification:

# User B's WebSocket connection receives the message via friend_request_notif.
# friend_request_notif sends the notification to User B's client.
# Role of channels_redis
# Channel Layer: channels_redis provides a Redis-backed channel layer that allows different consumers to communicate.
# Groups: It manages groups of channels, enabling broadcasting messages to multiple consumers.
# Message Passing: It handles the low-level details of passing messages between different WebSocket connections.

