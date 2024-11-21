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

# class   ListUsersView(FriendshipListView):
#     def list(self, request, *args, **kwargs):
#         # Call the parent class's `list` method to list friends
#         return super().list(request, *args, **kwargs)
    

# ********************* methode 1 *****************************

# class ListUsersView(FriendshipListView):
#     def list(self, request, *args, **kwargs):
#         # Get all friends data (this will return user instances)
#         all_friends_data = self.get_queryset()
        
#         # Fetch latest messages related to these friends
#         custom_user = request.customUser  # Get the current user from the request
#         latest_messages = Message.objects.filter(
#             Q(sender=custom_user) | Q(receiver=custom_user)
#         ).values('sender', 'receiver').annotate(
#             latest_timestamp=Max('timestamp')
#         ).order_by('-latest_timestamp')

#         # Initialize an empty dictionary to map friend IDs to their latest message timestamps.
#         friend_latest_map = {}

#         # Loop through each message in the list of latest messages.
#         for message in latest_messages:
#             # Check if the current user is the sender of the message.
#             if message['sender'] != custom_user.id:
#                 # If the sender is not the current user, the friend is the sender.
#                 friend_id = message['sender']
#                 # If the sender is the current user, then the friend is the receiver.
#                 friend_id = message['receiver']

#             # Store the friend's ID and the latest timestamp of the message in the dictionary.
#             friend_latest_map[friend_id] = message['latest_timestamp']

#         # Sort friends based on the latest message timestamp.
#         sorted_friends = sorted(
#             all_friends_data,
#             key=lambda friend: (
#             friend_latest_map.get(friend.id).timestamp() if friend_latest_map.get(friend.id) is not None else 0
#             ),
#             reverse=True  # Sort in descending order
#         )

#         # Return the ordered friends list.
#         serializer = UserSerializer(sorted_friends, many=True)
#         print('serializer.data    => ', serializer.data)
#         return Response(serializer.data)

# ********************* end methode 1 *****************************

# ********************* methode 2 *****************************


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
                Q(sender=custom_user, receiver=friend) | Q(sender=friend, receiver=custom_user)
            ).order_by('-timestamp').first()

             # Count unread messages for this friend
            unread_count = Message.objects.filter(
                sender=friend,
                receiver=custom_user,
                is_read=False
            ).count()

            if latest_message:
                # Store the latest message, timestamp, and is_read status
                friend_latest_map[friend.id] = {
                    "message": latest_message.message,
                    "timestamp": latest_message.timestamp,
                    # "is_read": latest_message.is_read
                    "is_read": latest_message.is_read if latest_message.receiver == custom_user else True,
                    "unread_count": unread_count  # Add unread message count
                }
            else:
                # No message found
                friend_latest_map[friend.id] = {
                    "message": '',
                    "timestamp": None,
                    "is_read": True,  # Default as read if no messages are found
                    "unread_count": 0  # Default to 0 if no messages
                }

        # Prepare a list with friends and their last message details
        friends_with_messages = []
        for friend in all_friends_data:
            latest_message = friend_latest_map.get(friend.id, None)
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
                    "is_read": True,
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


# ********************* end methode 2  *****************************



# # API to get chat history between the current user and a specific receiver
# class ChatHistoryView(APIView):
#     # Optionally remove the permission for testing purposes
#     # permission_classes = [IsAuthenticated]

#     def get(self, request, receiver_id, *args, **kwargs):
#         # Check if the customUser is set and authenticated
#         print("request ->", request)
#         print("request.customUser ->", request.customUser)
#         if request.customUser.is_anonymous:
#             return Response({"error": "User is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

#         try:
#             # Try to get the receiver
#             receiver = User.objects.get(id=receiver_id)
#         except User.DoesNotExist:
#             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Retrieve chat history between the authenticated user and the receiver
#         chat_history = Message.objects.filter(
#             sender=request.customUser, receiver=receiver
#         ) | Message.objects.filter(
#             sender=receiver, receiver=request.customUser
#         ).order_by('timestamp')

#         serializer = MessageSerializer(chat_history, many=True)
#         print('ChatHistoryView data = ->',serializer.data)
#         return Response(serializer.data)
    



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