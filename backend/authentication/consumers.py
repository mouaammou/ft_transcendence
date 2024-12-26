import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .redis_connection import redis_conn
from .models import Friendship, Notification
from django.db.models import Q
from .serializers import NotificationSerializer
from django.db import transaction, DatabaseError
from asgiref.sync import sync_to_async
import time
# from .notif_consumers import notification_consumers 

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
		print("\n CONNECTED\n")
		await self.accept()
		self.user = self.scope.get("user")
		if self.user and self.user.is_authenticated:
			self.user_windows = f"user_{self.user.id}"
			self.user_data = UserSerializer(self.user).data
			await self.add_user_to_groups()
        # Add the consumer to the notification_consumers dictionary
		# if self.user.id in notification_consumers:
		# 	notification_consumers[self.user.id].append(self.channel_name)
		# else:
		# 	notification_consumers[self.user.id] = [self.channel_name]

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
			self.scope['user'] = None  # Set the scope user to None
			print(f"\n scope user: {self.scope['user']}\n")
			# await self.close()

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
		print(f"\nSending notification alert to {group_name}\n")
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
		print(f"\nfriend_request_notif: {event}\n")
		try:
			await self.send(text_data=json.dumps({
				'type': 'send_friend_request',
				'success': event.get('success'),
				**event.get('notification')
			}))
		except Exception as e:
			logger.error(f"Error handling friend_request_received: {e}")

	# Handler for accept_friend_request event
	async def accept_request_notif(self, event):
		await self.send(text_data=json.dumps({
			'type': 'accept_friend_request',
			'success': event.get('success'),
			'user_id': event.get('user_id'),
			**event.get('notification')
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
   
   
	async def handle_accept_game(self, data):
		print(f"\naccept_game: {data}\n")
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
		print(f"new round: {data}\n")
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
			print(f"\nnotif_data: {notif_data}\n")
			await self.send_notification_alert(to_user_id, {
				'type': 'round_notification',
				'success': True,
				'notification': notif_data,
			})
		except Exception as e:
			logger.error(f"\nError sending game invite: {e}\n")

	async def handle_invite_to_game(self, data): 
		print(f"\ninvite_to_game: {data}\n")
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
		print(f"\nsend friend request to {to_user_id}")
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
		print(f"\naccept friend request from {to_user_id}")
		success, message, notif = await self.accept_friend_request(to_user_id)
		notif_data = NotificationSerializer(notif).data
		if (success):
			await self.send_notification_alert(to_user_id, {
				'type': 'accept_request_notif',
				'success': success,
				'user_id': notif_data.get('id'),
				'notification': notif_data,
			})

	async def handle_reject_request(self, data):
		rejected_user_id = data.get('to_user_id')
		print(f"\nhandle reject request from {rejected_user_id}")
		await self.send_notification_alert(rejected_user_id, {
			'type': 'reject_request_notif',
			'success': True,
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
					logger.info(f"\nFriend request accepted 🍸\n")
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
