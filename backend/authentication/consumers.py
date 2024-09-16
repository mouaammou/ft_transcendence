from channels.generic.websocket import AsyncWebsocketConsumer
from authentication.serializers import UserSerializer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from .models import Friendship, NotificationModel
from django.contrib.auth.models import AnonymousUser
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
				#accept the connection, the send_status_to_user needs that, otherwise error
				#add the user to their notification room
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
		if user:
			self.user = await database_sync_to_async(User.objects.get)(username=user)
			self.user_data = UserSerializer(self.user).data

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
	
	async def receive(self, text_data):
		data = json.loads(text_data)
		message_type = data.get('type')

		if message_type == 'send_friend_request':
				to_user_id = data.get('to_user_id')
				success, message = await self.send_friend_request(to_user_id)
				await self.send(text_data=json.dumps({
					'type': 'friend_request_sent',
					'success': success,
					'message': message
				}))
		elif message_type == 'accept_friend_request':
				request_id = data.get('request_id')
				success, message = await self.accept_friend_request(request_id)
				await self.send(text_data=json.dumps({
					'type': 'accept_friend_request',
					'success': success,
					'message': message
				}))
		elif message_type == 'reject_friend_request':
				rejected_id = data.get('rejected_id')
				await self.reject_friend_request(rejected_id)

	@database_sync_to_async
	def send_friend_request(self, to_user_id):
		try:
				to_user = User.objects.get(id=to_user_id)
				friend_request, created = Friendship.objects.get_or_create(sender=self.user.id, receiver=to_user_id)
				if created:
					notification = NotificationModel.objects.create(
						to_use=to_user,
						message=f"{self.user} send to you friend request"
					)
					if to_user.online:
								self.channel_layer.group_send(
								f"notifications_{to_user_id}",
								{
									'type': 'send_notification',
									'notification': {
										**self.user_data
									}
								}
						)
					return True, "Friend request sent successfully"
				else:
					return False, "Friend request already sent"
		except User.DoesNotExist:
				return False, "User not found"
	
	@database_sync_to_async
	def accept_friend_request(self, request_id):
		try:
				friend_request = Friendship.objects.get(sender=request_id, receiver=self.user.id)
				if friend_request.status == 'Pending':
					friend_request.status = 'Accepted'
					friend_request.save()

					notification = NotificationModel.objects.create(
						to_user=friend_request.sender,
						message=f"{self.user} accepted your friend request."
					)
					if friend_request.sender.online:
						self.channel_layer.group_send(
								f"notifications_{friend_request.sender.id}",
								{
									'type': 'send_notification',
									'notification': {
										**self.user_data
									}
								}
						)
					return True, "Friend request accepted"
				else:
					return False, "Friend request already processed"
		except Friendship.DoesNotExist:
				return False, "Friend request not found"
	
	@database_sync_to_async
	def reject_friend_request(self, rejected_id):
		try:
				friend_request = Friendship.objects.get(sender=rejected_id, receiver=self.user.id)
				if friend_request.status == 'Pending':
					friend_request.delete()
		except Friendship.DoesNotExist:
				return "Friend request not found"

	async def send_notification(self, event):
		notification = event['notification']
		await self.send(text_data=json.dumps({
				'type': 'notification',
				'notification': notification
		}))
