from authentication.models import Friendship, NotificationModel
from authentication.serializers import FriendsSerializer
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status, generics
from django.conf import settings

class CreateFriendshipRequest(generics.GenericAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendsSerializer

    def post(self, request):
        user = request.customUser
        receiver_id = request.data.get('receiver')
        message = f"{user} send to you a friend request."

        receiver = get_object_or_404(settings.AUTH_USER_MODEL, pk=receiver_id)

        try:
            friendship, created = Friendship.objects.get_or_create(sender=user, receiver=receiver)
            if created:
                NotificationModel.objects.create(user=receiver.id, message=message)
                return Response(status=status.HTTP_201_CREATED)
            else:
                return Response({"error": "Friendship request already exists."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'Error': str(e)}, status=status.HTTP_400_BAD_REQUEST)