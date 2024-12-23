from authentication.serializers import FriendsSerializer, UserSerializer, UserWithStatusSerializer
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from authentication.models import Friendship, CustomUser
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .allusers import CustomUserPagination
from django.db.models import Q

# ***************** Friendship List View ***************** #

class FriendshipListView(generics.ListAPIView):
    serializer_class = UserWithStatusSerializer
    pagination_class = CustomUserPagination

    def get_queryset(self):
        custom_user = self.request.customUser
        search_term = self.request.query_params.get('search', None)

        friendships = Friendship.objects.filter(
            Q(sender=custom_user) | Q(receiver=custom_user),
            Q(status='accepted') | Q(status='blocked')
        )

        unique_friends = []
        seen_users = set()

        for friendship in friendships:
            if friendship.sender == custom_user:
                friend = friendship.receiver
            else:
                friend = friendship.sender

            if friend.id not in seen_users:
                unique_friends.append({
                    'user': friend.id,
					'friend': friend,
                    'friendship_status': friendship.status
                })
                seen_users.add(friend.id)
        if search_term:
            unique_friends = [
                friend for friend in unique_friends
                if search_term.lower() in friend.get('friend').username.lower()
                # if search_term.lower() in friend['user'].username.lower()
            ]
        return unique_friends

    def list(self, request, *args, **kwargs):
        friends_queryset = self.get_queryset()
        paginator = self.pagination_class()
        paginated_users = paginator.paginate_queryset(friends_queryset, request)
        serializer = UserWithStatusSerializer(paginated_users, many=True)
        return paginator.get_paginated_response(serializer.data)
	

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

# ***************** Block Friendship View ***************** #
class BlockFriendshipView(generics.GenericAPIView):
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer


	def get_object(self, *args, **kwargs):
		friend_id = kwargs.get('pk')
		user_id = self.request.customUser.id
		if not user_id or not friend_id:
			return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
		friendship = Friendship.objects.filter(
			Q(sender_id=user_id, receiver_id=friend_id) | Q(sender_id=friend_id, receiver_id=user_id)
		).first()
		return friendship

	def post(self, request, *args, **kwargs):
		print("\nblock ::  friend\n")
		print(f"\nrequest: {request.data}\n")
		friendship = self.get_object(*args, **kwargs)
		print(f"frienship: {friendship.status}")

		if friendship.status == 'accepted':
			try:
				friendship.block()
				return Response({'status': 'friendship blocked'}, status=status.HTTP_200_OK)
			except ValidationError as e:
				return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		elif friendship.status == 'blocked':
			return Response({"error": "This request has already been blocked."}, status=status.HTTP_200_OK)

# ***************** Remove Blocked Friend View ***************** #
class RemoveBlockedFriend(generics.DestroyAPIView):
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer

	def get_object(self, *args, **kwargs):
		friend_id = kwargs.get('pk')
		user_id = self.request.customUser.id
		if not user_id or not friend_id:
			return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
		friendship = Friendship.objects.filter(
			Q(sender_id=user_id, receiver_id=friend_id) | Q(sender_id=friend_id, receiver_id=user_id)
		).first()
		return friendship

	def delete(self, request, *args, **kwargs):
		friendship = self.get_object(*args, **kwargs)
		print(f"\nfriendship: {friendship.status}\n")
		if friendship.status == 'blocked':
			# friendship.delete()
			friendship.accept()
			return Response({"message": "Blocked friend removed from blocked list."}, status=status.HTTP_200_OK)
		else:
			return Response({"error": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)

# ***************** Remove Friend View ***************** #
class RemoveFriend(generics.DestroyAPIView):
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer

	def get_object(self, *args, **kwargs):
			friend_id = kwargs.get('pk')
			user_id = self.request.customUser.id
			if not user_id or not friend_id:
				return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
			friendship = Friendship.objects.filter(
				Q(sender_id=user_id, receiver_id=friend_id) | Q(sender_id=friend_id, receiver_id=user_id)
			).first()
			return friendship

	def delete(self, request, *args, **kwargs):
		friendship = self.get_object(*args, **kwargs)
		if friendship.status == 'accepted':
			friendship.delete()
			return Response({"message": "Friend removed from friends list."}, status=status.HTTP_200_OK)
		else:
			return Response({"error": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)


# ***************** Reject Friendship View ***************** #
# delete the friendship request
class RejectFriendshipView(generics.DestroyAPIView):
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer

	def get_object(self, *args, **kwargs):
		friend_id = kwargs.get('pk')
		friendship = get_object_or_404(Friendship, pk=friend_id)
		return friendship

	def delete(self, request):
		friendship = self.get_object()
		if friendship.status == 'pending':
			friendship.delete()
			return Response({"message": "Friendship request rejected."}, status=status.HTTP_200_OK)
		else:
			return Response({"error": "This request has already been processed."}, status=status.HTTP_400_BAD_REQUEST)
