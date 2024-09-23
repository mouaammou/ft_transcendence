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

class OnlineStatusConsumer(AsyncWebsocketConsumer):
	USER_STATUS_GROUP = 'users_status'
	user_connections = {}

	async def connect(self):
		self.user = self.scope.get("user")
		if self.user and self.user.is_authenticated:
			self.user_data =  UserSerializer(self.user).data 
			self.room_notifications = f"notifications_{self.user.id}"
			try:
				await self.channel_layer.group_add(
					self.room_notifications,
					self.channel_name
				)
				await self.channel_layer.group_add(
					self.USER_STATUS_GROUP,
					self.channel_name
				)
				# Add the user to their own connection group
				if self.user.id not in self.user_connections:
					self.user_connections[self.user.id] = []
				#add the current channel to the user's connection group
				if self.channel_name not in self.user_connections[self.user.id]:
					self.user_connections[self.user.id].append(self.channel_name)
				# Add the user to the global status group
				number_of_connections = len(self.user_connections[self.user.id])
				if number_of_connections == 1:
					print(f"\n {self.user} is ONLINE\n")
					await self.update_user_status("online")
					print(f"\n broadcasting online : {self.user}\n")
					await self.broadcast_online_status(self.user_data, "online")
			except Exception as e:
				logger.error(f"\nError during connection: {e}\n")
				await self.close()
		await self.accept()

	async def disconnect(self, close_code):
		if self.user and self.user.is_authenticated:
			try:
				# Remove the user from their own connection group
				if self.user.id in self.user_connections:
					if self.channel_name in self.user_connections[self.user.id]:
						self.user_connections[self.user.id].remove(self.channel_name)
				# If the user has no connections, update their status to offline
				if self.user.id in self.user_connections:
					number_of_connections = len(self.user_connections[self.user.id])
					if number_of_connections == 0:
						print(f"\n {self.user} is offline\n")
						await self.update_user_status("offline")
						print(f"\n broadcasting offline : {self.user}\n")
						await self.broadcast_online_status(self.user_data, "offline")
						del self.user_connections[self.user.id]

				await self.channel_layer.group_discard(
					self.room_notifications,
					self.channel_name
				)
				await self.channel_layer.group_discard(
					self.USER_STATUS_GROUP,
					self.channel_name
				)
			except Exception as e:
				logger.error(f"\nError during disconnection: {e}\n")

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		user = text_data_json.get('user')
		logout = text_data_json.get('logout')
		online = text_data_json.get('online')

		# Handle user data, if sent
		print(f"\n USER IN ONLINE STATUS: 🍀 {text_data_json}\n")
		if user:
			self.user = await database_sync_to_async(User.objects.get)(username=user)
			self.user_data = UserSerializer(self.user).data
			print(f"user_data in onlinestatus: {self.user_data}\n")

		# Handle logout event
		if logout and self.user.is_authenticated:
			
			# Ensure the user is removed from the active connections
			if self.user.id in self.user_connections:
				if self.channel_name in self.user_connections[self.user.id]:
						self.user_connections[self.user.id].remove(self.channel_name)

				number_of_connections = len(self.user_connections[self.user.id])
				if number_of_connections == 0:
						print(f"\n {self.user} is offline due to logout\n")
						await self.update_user_status("offline")
						print(f"\n broadcasting offline when logout : {self.user}\n")
						await self.broadcast_online_status(self.user_data, "offline")
						# Remove user from the connections
						del self.user_connections[self.user.id]

			await self.channel_layer.group_discard(
				self.USER_STATUS_GROUP,
				self.channel_name
			)
			return  # Exit after handling logout to avoid conflicting operations

		# Handle online event
		if online and self.user.is_authenticated:
			await self.channel_layer.group_add(
				self.USER_STATUS_GROUP,
				self.channel_name
			)
			# If the user is not in connections, add them
			if self.user.id not in self.user_connections:
				self.user_connections[self.user.id] = []
			# Add the channel name to track their connection
			if self.channel_name not in self.user_connections[self.user.id]:
				self.user_connections[self.user.id].append(self.channel_name)

			number_of_connections = len(self.user_connections[self.user.id])
			if number_of_connections == 1:
				print(f"\n {self.user} is online due to profile page access\n")
				await self.update_user_status("online")
				print(f"\n broadcasting online when login: {self.user}\n")
				await self.broadcast_online_status(self.user_data, "online")

	@database_sync_to_async
	def update_user_status(self, status):
		try:
				User.objects.filter(id=self.user.id).update(status=status)
		except Exception as e:
				logger.error(f"\nError updating user status in database: {e}\n")

	async def broadcast_online_status(self, user_data, status):
		try:
			await self.channel_layer.group_send(
				self.USER_STATUS_GROUP,
				{
					'id': user_data['id'],
					"type": "user_status_change",
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


class NotificationConsumer(OnlineStatusConsumer):
	async def connect(self):
		await super().connect()

	async def disconnect(self, close_code):
		await super().disconnect(close_code)

# ************************ for sending friend request ************************
	async def send_friend_request_notif(self, channels, notification):
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
				'type': 'friend_request_received',
				'to_user_id': event.get('to_user_id'),
				'username': event.get('username'),
				'success': event.get('success'),
				'avatar': event.get('avatar'),
				'message': event.get('message')
			}))
		except Exception as e:
			logger.error(f"Error handling friend_request_received: {e}")
# end of sending friend request ************************************************

# ************************ for accepting friend request ************************
	async def send_accept_request_notif(self, channels, notification):
		"""Send the notification to all the user's channels."""
		for channel in channels:
			await self.channel_layer.send(channel, {
					**notification
			})

	async def accept_request_notif(self, event):
		print(f"\n ACCEPT FRIEND REQUEST: {event}\n")
		await self.send(text_data=json.dumps({
			'type': 'accept_friend_request',
			'success': event.get('success'),
			'message': event.get('message'),
			'username': event.get('username'),
			'user_id': event.get('user_id'),
			'avatar': event.get('avatar')
		}))
# enf of accepting friend request *********************************************

	async def receive(self, text_data):
		await super().receive(text_data)
		data = json.loads(text_data)
		message_type = data.get('type')

		print(f"\nmessage_type notif:: {data}")
		print(f"currnet user: {self.user.id}\n")
	
		if message_type == 'send_friend_request':
			to_user_id = data.get('to_user_id')
			success, message = await self.save_friend_request(to_user_id)
			try:
				# get the channel name of the user=to_user_id
				to_user_channels = self.user_connections.get(to_user_id)
				if not to_user_channels:
					logger.error(f"\nUser {to_user_id} is offline\n")
					return
				await self.send_friend_request_notif(to_user_channels, {
					'type': 'friend_request_notif',
					'success': success,
					'message': message,
					'to_user_id': self.user.id,
					'username': self.user_data['username'],
					'avatar': self.user_data['avatar']
				})
				logger.info(f"\nFriend request sent to {to_user_id}\n")
			except Exception as e:
				logger.error(f"\nError in send to_user_channels group :: {e}\n")
		elif message_type == 'accept_friend_request':	
			to_user_id = data.get('to_user_id')
			success, message = await self.accept_friend_request(to_user_id)
			print(f"\n accept_friend_request !!:\n")
			try:
				to_user_channels = self.user_connections.get(to_user_id)
				if not to_user_channels:
					logger.error(f"\nUser {to_user_id} is offline\n")
					return
				await self.send_accept_request_notif(to_user_channels, {
					'type': 'accept_request_notif',
					'success': success,
					'message': message,
					'username': self.user_data['username'],
					'user_id': self.user.id,
					'avatar': self.user_data['avatar']
				})
				logger.info(f"\nFriend request sent to {to_user_id}\n")
			except Exception as e:
				logger.error(f"\nError in accept to_user_channels group :: {e}\n")
		elif message_type == 'reject_friend_request':
			rejected = data.get('rejected')
			await self.reject_friend_request(rejected)

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
			print(f"\nAccepting friend request: {user_id}\n")
			sender = User.objects.get(id=user_id)
			print(f"\nsender: {sender}, receiver: {self.user}\n")

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
						reverse_friendship = Friendship.objects.get(sender=self.user, receiver=sender)
					except Friendship.DoesNotExist:
						# Create reverse friendship only if it doesn't exist
						Friendship.objects.create(sender=self.user, receiver=sender, status='accepted')

					# Send a notification to the sender
					NotificationModel.objects.create(
						sender=self.user,
						receiver=sender,
						message=f"{self.user} accepted your friend request."
					)

					return True, "Friend request accepted"
			else:
					return False, "Friend request already processed"

		except Friendship.DoesNotExist:
			return False, "Friend request not found."
		except Exception as e:
			logger.error(f"\nError Accepting friend request: {e}\n")
			return False, f"Error Accepting Friend request, reason :: {str(e)}"


	# @database_sync_to_async
	# def accept_friend_request(self, user_id):
	# 	try:
	# 		print(f"\n Accepting friend request: {user_id}\n")
	# 		sender = User.objects.get(id=user_id)
	# 		print(f"\n sender: {sender}, receiver: {self.user}\n")
	# 		friend_request = Friendship.objects.get(
	# 			Q(sender=sender, receiver=self.user) | Q(sender=self.user, receiver=sender)
	# 		)
	# 		if friend_request.status == 'pending':
	# 			friend_request.status = 'accepted'
	# 			friend_request.save()
	# 			# also create a reverse friendship
	# 			try:
	# 				reverse_friendship = Friendship.objects.get(sender=self.user, receiver=sender)
	# 				reverse_friendship.status = 'accepted'
	# 				reverse_friendship.save()

	# 			except Friendship.DoesNotExist:
	# 				Friendship.objects.create(sender=self.user, receiver=sender, status='accepted')

	# 			NotificationModel.objects.create(
	# 				sender=self.user,
	# 				receiver=sender,
	# 				message=f"{self.user} accepted your friend request."
	# 			)
	# 			return True, "Friend request accepted"
	# 		else:
	# 			return False, "Friend request already processed"
	# 	except Exception as e:
	# 		logger.error(f"\nError Accepting friend request: {e}\n")
	# 		return False, f"Error Accepting Friend request, reason :: {str(e)}"
	
	@database_sync_to_async
	def reject_friend_request(self, rejected):
		try:
			friend_request = Friendship.objects.get(
				Q(sender=rejected, receiver=self.user) | Q(sender=self.user, receiver=rejected)
			)
			if friend_request.status == 'pending':
				friend_request.delete()
				logger.info(f"\nFriend request rejected\n")
		except Exception as e:
			logger.error(f"\nError rejecting friend request: {e}\n")
			return f"Friend request not found or already processed, reason :: {str(e)}"
