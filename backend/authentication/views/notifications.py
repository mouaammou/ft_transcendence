from authentication.models import NotificationModel
from rest_framework import  generics
from authentication.serializers import NotificationSerializer
from .allusers import CustomUserPagination

class ListNotifications(generics.GenericAPIView):
	serializer_class = NotificationSerializer
	pagination_class = CustomUserPagination

	def get_queryset(self):
		return NotificationModel.objects.filter(receiver_id=self.request.customUser.id)	

	def get(self, request):
		queryset = self.get_queryset()
		paginator = self.pagination_class()
		paginated_notifications = paginator.paginate_queryset(queryset, request)
		serializer = self.get_serializer(paginated_notifications, many=True)
		return paginator.get_paginated_response(serializer.data)
