from django.contrib.auth import get_user_model
from authentication.serializers import UserSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

User = get_user_model()

class CustomUserPagination(PageNumberPagination):
	page_size = 8  # Number of users per page
	page_size_query_param = 'page_size'  # Allow clients to change the page size via query params
	max_page_size = 10  # Limit the maximum number of users per page

class AllUser(generics.GenericAPIView):
	queryset = User.objects.all()  # Correct the typo query_set to queryset
	serializer_class = UserSerializer
	pagination_class = CustomUserPagination  # Set the pagination class

	def get(self, request, *args, **kwargs):
		users = self.get_queryset()
		paginator = self.pagination_class()
		paginated_users = paginator.paginate_queryset(users, request)
		serializer = UserSerializer(paginated_users, many=True)
		# remove the current use from serializer data
		serializer_data = [user for user in serializer.data if user['id'] != request.customUser.id]
		return paginator.get_paginated_response(serializer_data)