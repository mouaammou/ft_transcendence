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

# class ListUsersView(FriendshipListView):
#     def list(self, request, *args, **kwargs):
#         # Step 1: Get all friends data (this will return user instances)
#         all_friends_data = self.get_queryset()
#         custom_user = request.customUser  # Current user

#         # Step 2: Prepare a list to hold each friend's data and last message
#         friends_with_messages = []

#         for friend in all_friends_data:
#             # Step 3: Get the latest message between the current user and this friend
#             last_message = Message.objects.filter(
#                 Q(sender=custom_user, receiver=friend) | Q(sender=friend, receiver=custom_user)
#             ).order_by('-timestamp').first()

#             # Step 4: Add the friend and last message to the list
#             friends_with_messages.append({
#                 "friend": friend,
#                 "last_message": last_message
#             })

#         # Step 5: Sort friends based on the timestamp of the last message
#         # friends_with_messages.sort(
#         #     key=lambda item: item['last_message'].timestamp if item['last_message'] else datetime.min,
#         #     reverse=True
#         # )

#         friends_with_messages.sort(
#             key=lambda item: item['last_message'].timestamp if item['last_message'] else datetime.datetime.min,
#             reverse=True  # Sort in descending order
#         )

#         # Step 6: Serialize the data using FriendWithLastMessageSerializer
#         serialized_data = FriendWithLastMessageSerializer(friends_with_messages, many=True).data

#         # Step 7: Return the response with the serialized data
#         return Response(serialized_data)


from django.utils import timezone
from datetime import datetime

from django.utils import timezone
from datetime import datetime
from rest_framework.response import Response
from django.db.models import Q, Max
from .models import Message
from .serializers import FriendWithLastMessageSerializer
from .views import FriendshipListView

class ListUsersView(FriendshipListView):
    def list(self, request, *args, **kwargs):
        # Get all friends data (this will return user instances)
        all_friends_data = self.get_queryset()
        custom_user = request.customUser  # Current user

        # Create a mapping of friend IDs to their last message and timestamp
        friend_latest_map = {}

        for friend in all_friends_data:
            # Get the most recent message between the user and the friend
            latest_message = Message.objects.filter(
                Q(sender=custom_user, receiver=friend) | Q(sender=friend, receiver=custom_user)
            ).order_by('-timestamp').first()

            if latest_message:
                # Store the latest message and timestamp
                friend_latest_map[friend.id] = {
                    "message": latest_message.message,
                    "timestamp": latest_message.timestamp
                }
            else:
                # No message found
                friend_latest_map[friend.id] = {
                    # "message": 'No message',
                    "message": '',
                    "timestamp": None
                }

        # Debug: Print the friend_latest_map to verify the data
        print("Friend latest map:")
        for friend_id, latest_message in friend_latest_map.items():
            print(f"Friend ID: {friend_id}, Last message: {latest_message['message']}, Timestamp: {latest_message['timestamp']}")

        # Prepare a list with friends and their last message details
        friends_with_messages = []
        for friend in all_friends_data:
            # Get the latest message for each friend or None if not found
            latest_message = friend_latest_map.get(friend.id, None)

            # Handle case where there's no message (None) for the friend
            if latest_message is not None:
                last_message = {
                    "message": latest_message.get('message', 'No message'),
                    "timestamp": latest_message.get('timestamp', None)
                }
            else:
                last_message = {
                    "message": 'No message',
                    "timestamp": None
                }

            # Debug: Print the last message for each friend
            print(f"Friend ID {friend.id}, Last message: {last_message['message']}")

            # Append friend and their last message to the list
            friends_with_messages.append({
                "friend": friend,
                "last_message": last_message
            })

        # Sort friends based on the latest message timestamp.
        timezone_aware_min = timezone.make_aware(datetime.min)  # Making it timezone-aware

        # Debug: Print the friends before sorting
        print("Friends before sorting:")
        for friend in friends_with_messages:
            print(f"Friend ID: {friend['friend'].id}, Last message: {friend['last_message']['message']}, Timestamp: {friend['last_message']['timestamp']}")

        # Sorting by timestamp, using timezone-aware min datetime as fallback for None values
        friends_with_messages.sort(
            key=lambda item: item['last_message']['timestamp'] if item['last_message']['timestamp'] is not None else timezone_aware_min,
            reverse=True  # Sort in descending order by timestamp
        )

        # Debug: Print the friends after sorting
        print("Friends after sorting:")
        for friend in friends_with_messages:
            print(f"Friend ID: {friend['friend'].id}, Last message: {friend['last_message']['message']}, Timestamp: {friend['last_message']['timestamp']}")

        # Serialize the data using the appropriate serializer
        serialized_data = FriendWithLastMessageSerializer(friends_with_messages, many=True).data

        # Debug: Print the serialized data to verify the result before sending response
        print("Serialized data to be returned:")
        print(serialized_data)

        # Return the response with the serialized data
        return Response(serialized_data)


# ********************* methode 2  *****************************



# API to get chat history between the current user and a specific receiver
class ChatHistoryView(APIView):
    # Optionally remove the permission for testing purposes
    # permission_classes = [IsAuthenticated]

    def get(self, request, receiver_id, *args, **kwargs):
        # Check if the customUser is set and authenticated
        print("request ->", request)
        print("request.customUser ->", request.customUser)
        if request.customUser.is_anonymous:
            return Response({"error": "User is not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Try to get the receiver
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Retrieve chat history between the authenticated user and the receiver
        chat_history = Message.objects.filter(
            sender=request.customUser, receiver=receiver
        ) | Message.objects.filter(
            sender=receiver, receiver=request.customUser
        ).order_by('timestamp')

        serializer = MessageSerializer(chat_history, many=True)
        print('ChatHistoryView data = ->',serializer.data)
        return Response(serializer.data)