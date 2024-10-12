# from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Message
from .serializers import MessageSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from authentication.views.friends import FriendshipListView
# Create your views here.


User = get_user_model()

class   ListUsersView(FriendshipListView):
    def list(self, request, *args, **kwargs):
        # Call the parent class's `list` method to list friends
        return super().list(request, *args, **kwargs)


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