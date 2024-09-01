from authentication.serializers import FriendsSerializer
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError, PermissionDenied
from authentication.models import Friendship
from django.contrib.auth.models import AnonymousUser
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

class FriendshipListCreateView(generics.ListCreateAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

class FriendshipRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

class AcceptFriendshipView(generics.GenericAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

    def post(self, request, pk):
        friendship = get_object_or_404(Friendship, pk=pk)

        if friendship.status == 'pending':
            try:
                friendship.accept()
                return Response({"message": "Friendship request accepted."}, status=status.HTTP_200_OK)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

class BlockFriendshipView(generics.GenericAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

    def post(self, request, *args, **kwargs):
        friendship = self.get_object()

        if friendship.status == 'accepted':
            try:
                friendship.blocked()
                return Response({'status': 'friendship blocked'}, status=status.HTTP_200_OK)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

