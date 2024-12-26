from authentication.serializers import FriendsSerializer, UserSerializer, UserWithStatusSerializer
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from authentication.models import Friendship, CustomUser
from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .allusers import CustomUserPagination
from django.db.models import Q 
import logging as logger

# ***************** Friendship List View ***************** #

class FriendshipListView(generics.ListAPIView):
	serializer_class = UserWithStatusSerializer
	pagination_class = CustomUserPagination

	def get_queryset(self):
		custom_user = self.request.customUser
		search_term = self.request.query_params.get('search', None)

		friendships = Friendship.objects.filter(
			Q(sender=custom_user, status__in=['accepted', 'blocking']) |
			Q(receiver=custom_user, status__in=['accepted', 'blocked']) |
			Q(sender=custom_user, received_status__in=['accepted', 'blocking']) |
			Q(receiver=custom_user, received_status__in=['accepted', 'blocked'])
		)

		unique_friends = []
		seen_users = set()

		for friendship in friendships:
			friend = friendship.receiver if friendship.sender == custom_user else friendship.sender
			
			if friend.id not in seen_users:
				friend_data = {
					'user': friend.id,
					'friend': friend,
					'friendship_status': friendship.status,
					'received_status': friendship.received_status
				}

				# Adjust status based on relationship
				if friendship.sender == custom_user:
					friend_data['friendship_status'] = friendship.status
					friend_data['received_status'] = 'blocked' if friendship.status == 'blocking' else friendship.received_status
				else:
					# If current user is receiver, swap the statuses
					friend_data['friendship_status'] = 'blocked' if friendship.received_status == 'blocking' else friendship.received_status
					friend_data['received_status'] = friendship.status

				unique_friends.append(friend_data)
				seen_users.add(friend.id)

		if search_term:
			unique_friends = [
				friend for friend in unique_friends 
				if search_term.lower() in friend['friend'].username.lower()
			]
			
		return unique_friends

	def list(self, request, *args, **kwargs):
		friends_queryset = self.get_queryset()
		paginator = self.pagination_class()
		paginated_users = paginator.paginate_queryset(friends_queryset, request)
		serializer = UserWithStatusSerializer(
			paginated_users, 
			many=True, 
			context={'request': request}
		)
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
		try:
			user_id = self.request.customUser.id
			if not user_id or not friend_id:
				return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
			
			friendship = Friendship.objects.filter(
				Q(sender_id=user_id, receiver_id=friend_id) |
				Q(sender_id=friend_id, receiver_id=user_id)
			).first()

			print(f"\n 333: {friendship}")
			
			if not friendship:
				friendship = Friendship.objects.create(
					sender_id=user_id,
					receiver_id=friend_id,
					status='pending'
				)
			return friendship
		except Exception as e:
			logger.error(f"\nError in BlockFriendshipView: {e}\n")
			return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

	def post(self, request, *args, **kwargs):
		try:
			friendship = self.get_object(*args, **kwargs)
			
			if friendship.status in ['blocking', 'blocked']:
				return Response({"status": "already"}, status=status.HTTP_200_OK)
			
			try:
				# Make sure current user is sender for blocking
				if friendship.sender != request.customUser:
					# Swap sender and receiver
					# friendship.sender, friendship.receiver = friendship.receiver, friendship.sender
					sender = friendship.sender
					receiver = friendship.receiver
					friendship.delete()
					friendship = Friendship.objects.create(
						sender=receiver,
						receiver=sender,
						status='blocking',
						received_status='blocked'
					)
					friendship.save()

				
				friendship.block()
				return Response({
					'status': 'blocking',
					'received_status': 'blocked'
				}, status=status.HTTP_200_OK)
			except ValidationError as e:
				return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as e:
			logger.error(f"\nError in BlockFriendshipView: 1001 {e}\n")
			return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ***************** Remove Blocked Friend View ***************** #
class RemoveBlockedFriend(generics.DestroyAPIView):
	queryset = Friendship.objects.all()
	serializer_class = FriendsSerializer

	def get_object(self, *args, **kwargs):
		friend_id = kwargs.get('pk')
		user_id = self.request.customUser.id
		print(f"profile id: {friend_id}, {user_id}")
		if not user_id or not friend_id:
			return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
		
		friendship = Friendship.objects.filter(
			Q(sender_id=user_id, receiver_id=friend_id, status='blocking') |
			Q(sender_id=friend_id, receiver_id=user_id, status='blocked') |
			Q(sender_id=user_id, receiver_id=friend_id, status='blocked') |
			Q(sender_id=friend_id, receiver_id=user_id, status='blocking')
		).first()
		return friendship

	def delete(self, request, *args, **kwargs):
		friendship = self.get_object(*args, **kwargs)
		if not friendship:
			return Response({"error": "No blocking relationship found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Update the status and received_status to 'accepted'
		friendship.status = 'accepted'
		friendship.received_status = 'accepted'
		friendship.save()

		# Update the reciprocal friendship
		reciprocal_friendship = Friendship.objects.filter(
			sender=friendship.receiver,
			receiver=friendship.sender
		).first()
		
		if reciprocal_friendship:
			reciprocal_friendship.status = 'accepted'
			reciprocal_friendship.received_status = 'accepted'
			reciprocal_friendship.save()
		
		return Response({"message": "Block removed successfully, friendship accepted"}, status=status.HTTP_200_OK)

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
