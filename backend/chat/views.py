# from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from authentication.views.friends import FriendshipListView



from django.db.models import Q, Max
from authentication.models import Friendship, CustomUser
from authentication.serializers import UserSerializer


# Create your views here.


User = get_user_model()

# class   ListUsersView(FriendshipListView):
#     def list(self, request, *args, **kwargs):
#         # Call the parent class's `list` method to list friends
#         return super().list(request, *args, **kwargs)
    
class ListUsersView(FriendshipListView):
    def list(self, request, *args, **kwargs):
        # Step 1: Get all friends data (this will return user instances)
        all_friends_data = self.get_queryset()
        
        # Step 2: Fetch latest messages related to these friends
        custom_user = request.customUser  # Get the current user from the request
        latest_messages = Message.objects.filter(
            Q(sender=custom_user) | Q(receiver=custom_user)
        ).values('sender', 'receiver').annotate(
            latest_timestamp=Max('timestamp')
        ).order_by('-latest_timestamp')

        # Step 3: Initialize an empty dictionary to map friend IDs to their latest message timestamps.
        friend_latest_map = {}

        # Step 4: Loop through each message in the list of latest messages.
        for message in latest_messages:
            # Step 5: Check if the current user is the sender of the message.
            if message['sender'] != custom_user.id:
                # If the sender is not the current user, the friend is the sender.
                friend_id = message['sender']  # The friend is the sender of the message.
            else:
                # If the sender is the current user, then the friend is the receiver.
                friend_id = message['receiver']  # The friend is the receiver of the message.

            # Step 6: Store the friend's ID and the latest timestamp of the message in the dictionary.
            friend_latest_map[friend_id] = message['latest_timestamp']

        # Step 7: Sort friends based on the latest message timestamp.
        sorted_friends = sorted(
            all_friends_data,
            key=lambda friend: (
            friend_latest_map.get(friend.id).timestamp() if friend_latest_map.get(friend.id) is not None else 0
            ),
            reverse=True  # Sort in descending order
        )

        # Step 8: Return the ordered friends list.
        serializer = UserSerializer(sorted_friends, many=True)
        print('serializer.data    => ', serializer.data)
        return Response(serializer.data)



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