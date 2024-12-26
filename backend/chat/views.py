# from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer ,FriendWithLastMessageSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from authentication.views.friends import FriendshipListView
from django.db.models import Q, Max
from authentication.serializers import UserSerializer


from datetime import datetime
from django.utils import timezone  # Make sure to import timezone

from rest_framework.pagination import PageNumberPagination


# Create your views here.


User = get_user_model()

class ListUsersView(FriendshipListView):
    def list(self, request, *args, **kwargs):
        # Get all friends data
        all_friends_data = self.get_queryset()
        custom_user = request.customUser  # Current user

        # Create a mapping of friend IDs to their last message, timestamp, and is_read status
        friend_latest_map = {}

        for friend in all_friends_data:
            # Get the most recent message between the user and the friend
            latest_message = Message.objects.filter(
                Q(sender=custom_user, receiver=friend.get('user')) | Q(sender=friend.get('user'), receiver=custom_user)
            ).order_by('-timestamp').first()

             # Count unread messages for this friend
            unread_count = Message.objects.filter(
                sender=friend.get('user'),
                receiver=custom_user,
                is_read=False
            ).count()

            if latest_message:
                # Store the latest message, timestamp, and is_read status
                friend_latest_map[friend.get('user')] = {
                    "message": latest_message.message,
                    "timestamp": latest_message.timestamp,
                    # "is_read": latest_message.is_read
                    "is_read": latest_message.is_read if latest_message.receiver == custom_user else True,
                    "unread_count": unread_count  # Add unread message count
                }
            else:
                # No message found
                friend_latest_map[friend.get('user')] = {
                    "message": '',
                    "timestamp": None,
                    "is_read": False,  # Default as read if no messages are found
                    "unread_count": 0  # Default to 0 if no messages
                }

        # Prepare a list with friends and their last message details
        friends_with_messages = []
        for friend in all_friends_data:
            latest_message = friend_latest_map.get(friend.get('user'), None)
            if latest_message:
                last_message = {
                    "message": latest_message.get('message', 'No message'),
                    "timestamp": latest_message.get('timestamp', None),
                    "is_read": latest_message.get('is_read', True),
                    "unread_count": latest_message.get('unread_count', 0)  # Include unread_count
                }
            else:
                last_message = {
                    "message": 'No message',
                    "timestamp": None,
                    # "is_read": True,
                    "is_read": False,
                    "unread_count": 0
                }

            # Append friend and their last message to the list
            friends_with_messages.append({
                "friend": friend,
                "last_message": last_message
            })

        # Sort friends by timestamp (most recent first)
        timezone_aware_min = timezone.make_aware(datetime.min)  # Timezone-aware minimum datetime

        friends_with_messages.sort(
            key=lambda item: item['last_message']['timestamp'] or timezone_aware_min,
            reverse=True
        )

        # Serialize the data using the appropriate serializer
        serialized_data = FriendWithLastMessageSerializer(friends_with_messages, many=True).data

        print("Serialized data to be returned:")
        print(serialized_data)

        # Return the response with the serialized data
        return Response(serialized_data)


# Custom Pagination class
class ChatPagination(PageNumberPagination):
    page_size = 15  # Messages per page
    page_size_query_param = 'page_size'
    max_page_size = 50


class ChatHistoryView(APIView):
    def get(self, request, receiver_id, *args, **kwargs):
        if request.customUser.is_anonymous:
            return Response({"error": "User is not authenticated"}, status=401)

        # Validate receiver
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Fetch messages
        chat_history = Message.objects.filter(
            Q(sender=request.customUser, receiver=receiver) |
            Q(sender=receiver, receiver=request.customUser)
        ).order_by('-timestamp')  # Most recent messages first

        # Paginate messages
        paginator = ChatPagination()
        paginated_messages = paginator.paginate_queryset(chat_history, request)
        serialized_messages = MessageSerializer(paginated_messages, many=True)


        print('Next page URL:', paginator.get_next_link())  # Check next URL
        
        print('ChatHistoryView data = ->',serialized_messages.data)
        return paginator.get_paginated_response(serialized_messages.data)