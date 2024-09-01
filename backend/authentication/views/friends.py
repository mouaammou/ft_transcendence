from authentication.serializers import FriendsSerializer
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError, PermissionDenied
from authentication.models import Friendship
from django.contrib.auth.models import AnonymousUser
from rest_framework import status
from rest_framework.response import Response

class FriendshipListCreateView(generics.ListCreateAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

class FriendshipRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

class AcceptFriendshipView(generics.GenericAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

    def post(self, request, *args, **kwargs):
        friendship = self.get_object()
        try:
            friendship.accept()
            return Response({'status': 'friendship accepted'}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BlockFriendshipView(generics.GenericAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

    def post(self, request, *args, **kwargs):
        friendship = self.get_object()
        friendship.blocked()
        return Response({'status': 'friendship blocked'}, status=status.HTTP_200_OK)
