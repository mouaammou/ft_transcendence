from django.contrib.auth import get_user_model
from authentication.serializers import UserSerializer
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from authentication.models import Friendship
from django.db.models import Q

User = get_user_model()

class CustomUserPagination(PageNumberPagination):
	page_size = 8  # Number of users per page
	page_size_query_param = 'page_size'  # Allow clients to change the page size via query params
	max_page_size = 10  # Limit the maximum number of users per page

class AllUser(generics.GenericAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = CustomUserPagination

    def get(self, request, *args, **kwargs):
        # Get all friendships where the current user is involved
        current_user = request.customUser
        
        # Find all users who are friends with current user
        friend_ids = Friendship.objects.filter(
            (Q(sender=current_user) | Q(receiver=current_user)) &
            Q(status='accepted')
        ).values_list(
            'sender_id', 'receiver_id'
        ).distinct()

        # Flatten and get unique friend IDs
        friends_set = set()
        for sender_id, receiver_id in friend_ids:
            if sender_id != current_user.id:
                friends_set.add(sender_id)
            if receiver_id != current_user.id:
                friends_set.add(receiver_id)

        # Get all users except friends and current user
        users = self.get_queryset().exclude(
            Q(id__in=friends_set) | Q(id=current_user.id)
        )

        # Handle pagination
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(paginated_users, many=True)
        
        return paginator.get_paginated_response(serializer.data)