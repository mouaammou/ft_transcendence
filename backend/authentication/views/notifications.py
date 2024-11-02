from authentication.models import Notification
from rest_framework import  generics
from authentication.serializers import NotificationSerializer
from .allusers import CustomUserPagination
from rest_framework.response import Response
from rest_framework import status

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


