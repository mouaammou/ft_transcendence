from authentication.serializers import FriendsSerializer, UserSerializer
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
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer
	pagination_class = CustomUserPagination

	def get_queryset(self):
		user = self.request.customUser
		return Friendship.objects.filter(Q(sender=user) | Q(receiver=user))

	def list(self, request, *args, **kwargs):
		friendships = self.get_queryset()
		friends = set()
		for friendship in friendships:
			if friendship.sender == request.customUser:
					friends.add(friendship.receiver)
			else:
					friends.add(friendship.sender)
		# Serialize the data
		serializer = FriendsSerializer(friendships, many=True)
		
		# Custom data structure to avoid duplicates
		unique_friends = []
		added_usernames = set()

		for item in serializer.data:
			friend = item['sender'] if item['sender']['username'] != request.customUser.username else item['receiver']
			if friend['username'] not in added_usernames:
					unique_friends.append({
						'username': friend['username'],
						'avatar': friend['avatar'],
						'status': item['status'],
						'created_at': item['created_at']
					})
					added_usernames.add(friend['username'])
		# Paginate the unique friends list
		users = self.paginate_queryset(unique_friends)
		return self.get_paginated_response(users)
# end friendship list view ***************** #

class FriendshipRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer

class AcceptFriendshipView(generics.GenericAPIView):
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer

	def post(self, request, pk):
		friendship = get_object_or_404(Friendship, pk=pk)

		if friendship.status in ('accepted', 'pending') :
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
		elif friendship.status == 'blocked':
				return Response({"error": "This request has already been blocked."}, status=status.HTTP_400_BAD_REQUEST)

#get all friends: blocked and accepted
	