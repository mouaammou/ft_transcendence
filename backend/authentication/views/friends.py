from rest_framework import generics, permissions
from authentication.models import Friendship
from authentication.serializers import FriendshipSerializer


# list the user friends, or create a new friend for the user
class FriendshipListCreateView(generics.ListCreateAPIView):
    serializer_class = FriendshipSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.customUser #moaud _> said
        return Friendship.objects.filter(user1=user) | Friendship.objects.filter(user2=user)
    
    def perfom_create(self, serializer):
        user1 = self.request.customUser
        user2 = serializer.validated_data['friend']

        if user1.id > user2.id:
            user1 , user2 = user2, user1

        if not Friendship.objects.filter(user1=user1, user2=user2).exists():
            serializer.save(user1=user1, user2=user2)

# for delete or cancel the friendship, means friends recode will be destroy
class CancelFriendshipView(generics.DestroyAPIView):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user1 = self.request.customUser
        user2 = self.kwargs['friend_id']
        if user1.id > user2.id:
            user1 , user2 = user2, user1
        return Friendship.objects.filter(user1=user1, user2=user2)

