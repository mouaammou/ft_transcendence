from authentication.models import Notification
from rest_framework import  generics
from authentication.serializers import NotificationSerializer
from .allusers import CustomUserPagination
from rest_framework.response import Response
from rest_framework import status

# List all notifications for a user
class ListNotifications(generics.GenericAPIView):
	serializer_class = NotificationSerializer
	pagination_class = CustomUserPagination

	def get_queryset(self):
		return Notification.objects.filter(receiver_id=self.request.customUser.id)

	def get(self, request):
		queryset = self.get_queryset()
		paginator = self.pagination_class()
		paginated_notifications = paginator.paginate_queryset(queryset, request)
		serializer = self.get_serializer(paginated_notifications, many=True)
		return paginator.get_paginated_response(serializer.data)
	

# List all unread notifications for a user
class UnreadNotifications(generics.GenericAPIView):
	serializer_class = NotificationSerializer
	pagination_class = CustomUserPagination

	def get_queryset(self):
		return Notification.objects.filter(receiver_id=self.request.customUser.id, is_read=False)

	def get(self, request):
		queryset = self.get_queryset()
		paginator = self.pagination_class()
		paginated_notifications = paginator.paginate_queryset(queryset, request)
		serializer = self.get_serializer(paginated_notifications, many=True)
		return paginator.get_paginated_response(serializer.data)


# Mark a notification as read
class MarkNotificationRead(generics.GenericAPIView):
	serializer_class = NotificationSerializer

	def get_queryset(self):
		return Notification.objects.filter(receiver_id=self.request.customUser.id)

	def post(self, request, pk):
		notification = self.get_object()
		notification.is_read = True
		notification.save()
		serializer = self.get_serializer(notification)
		return Response(serializer.data, status=status.HTTP_200_OK)


# Accept a friend request
class AcceptFriendRequest(generics.GenericAPIView):
	serializer_class = NotificationSerializer

	def post(self, request):
		print(f"\naccepting friend request\n")
		new_notification = Notification.objects.create(
			sender=request.customUser,
			receiver_id=request.data['receiver_id'],
			message= f"{request.customUser.username} has accepted your friend request via VIEW",
			notif_type= "friend",
			notif_status='accepted'
		)
		serializer = self.get_serializer(new_notification)
		#call the accept function
		new_notification.accept() #accept the friend request, will create a reciprocal friendship if needed
		return Response(serializer.data, status=status.HTTP_201_CREATED)

# create notification for pending friend request
class PendingFrienshipRequest(generics.GenericAPIView):
	serializer_class = NotificationSerializer

	def post(self, request):
		new_notification = Notification.objects.create(
			sender=request.customUser,
			receiver_id=request.data['receiver_id'],
			message=request.data['message'],
			notif_type=request.data['notif_type'],
			notif_status='pending'
		)
		serializer = self.get_serializer(new_notification)
		return Response(serializer.data, status=status.HTTP_201_CREATED)
