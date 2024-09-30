from channels.generic.websocket import AsyncWebsocketConsumer
from authentication.serializers import UserSerializer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from .models import Friendship, NotificationModel
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
import logging
import json

User = get_user_model()
logger = logging.getLogger(__name__)

class BaseConsumer(AsyncWebsocketConsumer):
	USER_STATUS_GROUP = 'users_status'
	user_connections = {}

	async def connect(self):
		print("\n CONNECTED\n")
		self.user = self.scope.get("user")
		if self.user and self.user.is_authenticated:
				self.user_data = UserSerializer(self.user).data
				self.room_notifications = f"notifications_{self.user.id}"
				await self.add_user_to_groups()
		await self.accept()

	async def disconnect(self, close_code):
		print("\n DISCONNECT\n")
		if self.user and self.user.is_authenticated:
			await self.remove_user_from_groups()

	async def receive(self, text_data):
		print("\n RECEIVED\n")
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

		# Handle online event
		elif online and self.user.is_authenticated:
			await self.track_user_connection()

	async def add_user_to_groups(self):
		try:
			await self.channel_layer.group_add(self.room_notifications, self.channel_name)
			await self.channel_layer.group_add(self.USER_STATUS_GROUP, self.channel_name)
			await self.track_user_connection()
		except Exception as e:
			logger.error(f"\nError during connection: {e}\n")

	async def track_user_connection(self):
		if self.user.id not in self.user_connections:
			self.user_connections[self.user.id] = []
		if self.channel_name not in self.user_connections[self.user.id]:
			self.user_connections[self.user.id].append(self.channel_name)
		if len(self.user_connections[self.user.id]) == 1:
			print(f"\n broadcasting online when login: {self.user}\n")
			await self.broadcast_online_status(self.user_data, "online")

	async def untrack_user_connection(self):
		if self.user.id in self.user_connections:
			if self.channel_name in self.user_connections[self.user.id]:
				self.user_connections[self.user.id].remove(self.channel_name)
			if len(self.user_connections[self.user.id]) == 0:
				print(f"\n broadcasting offline when logout: {self.user}\n")
				await self.broadcast_online_status(self.user_data, "offline")
				del self.user_connections[self.user.id]

	async def remove_user_from_groups(self):
		try:
			await self.channel_layer.group_discard(self.room_notifications, self.channel_name)
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
			# if event['id'] != self.user.id:
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
	async def send_notification_notif(self, channels, notification):
		"""Send the notification to all the user's channels."""
		for channel in channels:
			await self.channel_layer.send(channel, {
					**notification
			})

	#handler for friend_request_received event
	async def friend_request_notif(self, event):
		try:
			print(f"\n SEND FRIEND REQUEST: {event}\n")
			await self.send(text_data=json.dumps({
				'type': 'friend_request',
				'to_user_id': event.get('to_user_id'),
				'username': event.get('username'),
				'success': event.get('success'),
				'avatar': event.get('avatar'),
				'message': event.get('message')
			}))
		except Exception as e:
			logger.error(f"Error handling friend_request_received: {e}")

	# handler for accept_friend_request event
	async def accept_request_notif(self, event):
		print(f"\n ACCEPT FRIEND REQUEST: {event}\n")
		await self.send(text_data=json.dumps({
			'type': 'accept_friend',
			'success': event.get('success'),
			'message': event.get('message'),
			'username': event.get('username'),
			'user_id': event.get('user_id'),
			'avatar': event.get('avatar')
		}))
# enf of friend request *********************************************

# ************************ for rejecting friend request ************************
	async def reject_request_notif(self, event):
		print(f"\n REJECT FRIEND REQUEST: {event}\n")
		await self.send(text_data=json.dumps({
			'type': 'reject_friend',
			'success': event.get('success'),
			'user_id': event.get('user_id'),
		}))
# end of rejecting friend request *********************************************

	async def handle_event(self, data):
		message_type = data.get('type')
		if message_type == 'send_friend_request':
				await self.handle_friend_request(data)
		elif message_type == 'accept_friend_request':
				await self.handle_accept_request(data)
		elif message_type == 'reject_friend_request':
				await self.handle_reject_request(data)

	async def handle_friend_request(self, data):
		to_user_id = data.get('to_user_id')
		success, message = await self.save_friend_request(to_user_id)
		to_user_channels = self.user_connections.get(to_user_id)
		if not to_user_channels:
			logger.error(f"\nUser {to_user_id} is offline\n")
			return
		await self.send_notification_notif(to_user_channels, {
			'type': 'friend_request_notif',
			'success': success,
			'message': message,
			'to_user_id': self.user.id,
			'username': self.user_data['username'],
			'avatar': self.user_data['avatar']
		})

	async def handle_accept_request(self, data):
		to_user_id = data.get('to_user_id')
		success, message = await self.accept_friend_request(to_user_id)
		to_user_channels = self.user_connections.get(to_user_id)
		if not to_user_channels:
			logger.error(f"\nUser {to_user_id} is offline\n")
			return
		await self.send_notification_notif(to_user_channels, {
			'type': 'accept_request_notif',
			'success': success,
			'message': message,
			'username': self.user_data['username'],
			'user_id': self.user.id,
			'avatar': self.user_data['avatar']
		})

	async def handle_reject_request(self, data):
		rejected_user_id = data.get('to_user_id')
		reject_status = await self.reject_friend_request(rejected_user_id)
		to_user_channels = self.user_connections.get(rejected_user_id)
		if not to_user_channels:
			logger.error(f"\nUser {rejected_user_id} is offline\n")
			return
		await self.send_notification_notif(to_user_channels, {
			'type': 'reject_request_notif',
			'success': reject_status,
			'user_id': self.user.id,
		})

	async def receive(self, text_data):
		await super().receive(text_data)
		data = json.loads(text_data)
		print(f"\nmessage_type notif:: {data}")
		print(f"currnet user: {self.user.id}\n")
		await self.handle_event(data)

	@database_sync_to_async
	def save_friend_request(self, to_user_id):
		try:
			to_user = User.objects.get(id=to_user_id)
			friend_request, created = Friendship.objects.get_or_create(sender=self.user, receiver=to_user, status='pending')
			if created:
				NotificationModel.objects.create(
					sender=self.user,
					receiver=to_user,
					message=f"{self.user} send to you friend request"
				)
				return True, "Friend request sent successfully"
			elif friend_request.status == 'pending':
				logger.error(f"\nFriend request already sent\n")
				return False, "Friend request already sent"
			else:
				return False, "Friend request already processed"
		except Exception as e:
			logger.error(f"\nError sending friend request: {e}\n")
			return False, f"Error sending friend request, reason :: {str(e)}"
	
	@database_sync_to_async
	def accept_friend_request(self, user_id):
		try:
			sender = User.objects.get(id=user_id)
			# Fetch the friend request (either direction)
			friend_request = Friendship.objects.get(
					Q(sender=sender, receiver=self.user) | Q(sender=self.user, receiver=sender)
			)

			# Check if the friend request is still pending
			if friend_request.status == 'pending':
				friend_request.status = 'accepted'
				friend_request.save()

				# Check if the reverse friendship exists and avoid duplicate creation
				try:
					Friendship.objects.get(sender=self.user, receiver=sender)
				except Friendship.DoesNotExist:
					# Create reverse friendship only if it doesn't exist
					Friendship.objects.create(sender=self.user, receiver=sender, status='accepted')

				# Send a notification to the sender
				NotificationModel.objects.create(
					sender=self.user,
					receiver=sender,
					message=f"{self.user} accepted your friend request."
				)
				logger.info(f"\nFriend request accepted 🍸\n")
				return True, "Friend request accepted"
			else:
				return False, "Friend request already processed"

		except Friendship.DoesNotExist:
			return False, "Friend request not found."
		except Exception as e:
			logger.error(f"\nError Accepting friend request: {e}\n")
			return False, f"Error Accepting Friend request, reason :: {str(e)}"

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

