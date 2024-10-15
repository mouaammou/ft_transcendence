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
	serializer_class = FriendsSerializer
	pagination_class = CustomUserPagination

	def get_queryset(self):
		# Get the current user from the request
		custom_user = self.request.customUser
		# add by mohammed
		search_term = self.request.query_params.get('search', None)  # Get search term if present

		# Filter for friendships where the user is either the sender or receiver
		# and the status is 'accepted'
		friendships = Friendship.objects.filter(
			Q(sender=custom_user) | Q(receiver=custom_user),
			status='accepted'
		)
		
		
		# Extract unique friends (either the receiver or sender)
		unique_friends = []
		for friendship in friendships:
			if friendship.sender == custom_user:
					unique_friends.append(friendship.receiver)
			else:
					unique_friends.append(friendship.sender)

		unique_friends = set(unique_friends)

		# If a search term is provided, filter unique friends based on the search term
		if search_term:
			filtered_friends = []
			
			for user in unique_friends:
				if search_term.lower() in user.username.lower():
					# If a match is found, add the user to the filtered_friends list
					filtered_friends.append(user)
			# Update unique_friends to contain only the filtered results
			unique_friends = filtered_friends

		# Convert the set back to a list for pagination
		unique_friends = list(unique_friends)

		
		return unique_friends

	def list(self, request, *args, **kwargs):
		# Get the unique friends queryset
		friends_queryset = self.get_queryset()
		paginator = self.pagination_class()
		paginated_users = paginator.paginate_queryset(friends_queryset, request)
			# Serialize the paginated data
		serializer = UserSerializer(paginated_users, many=True)
		
		
		# Return paginated response
		return paginator.get_paginated_response(serializer.data)
	

	# def get(self, request, *args, **kwargs):
	# 	users = self.get_queryset()
	# 	paginator = self.pagination_class()
	# 	paginated_users = paginator.paginate_queryset(users, request)
	# 	serializer = UserSerializer(paginated_users, many=True)
	# 	return paginator.get_paginated_response(serializer.data)



# class FriendshipListView(generics.ListAPIView):
# 	serializer_class = FriendsSerializer
# 	pagination_class = CustomUserPagination

# 	def get_queryset(self):
# 		# Get the current user from the request
# 		custom_user = self.request.customUser
# 		print(f"custom_user :: {custom_user}\n")
		
# 		# Filter for friendships where the user is either the sender or receiver
# 		# and the status is 'accepted'
# 		queryy = Friendship.objects.filter(
# 			Q(sender=custom_user) | Q(receiver=custom_user),
# 			status='Accepted'
# 		)
# 		print(f"queryy :: {queryy}\n")
# 		return queryy

	# def get_queryset(self):
	# 	user = self.request.customUser
	# 	return Friendship.objects.(Q(sender=user) | Q(receiver=user), status='accepted')

	# def list(self, request, *args, **kwargs):
	# 	friendships = self.get_queryset()
	# 	print(f"friendships :: {friendships}\n")
		# friends = set()
		# for friendship in friendships:
		# 	if friendship.sender == request.customUser:
		# 			friends.add(friendship.receiver)
		# 	else:
		# 			friends.add(friendship.sender)
		# # Serialize the data
		# serializer = FriendsSerializer(friendships, many=True)
		
		# # Custom data structure to avoid duplicates
		# unique_friends = []
		# added_usernames = set()

		# for item in serializer.data:
		# 	friend = item['sender'] if item['sender']['username'] != request.customUser.username else item['receiver']
		# 	if friend['username'] not in added_usernames:
		# 			unique_friends.append({
		# 				'username': friend['username'],
		# 				'avatar': friend['avatar'],
		# 				'status': item['status'],
		# 				'created_at': item['created_at']
		# 			})
		# 			added_usernames.add(friend['username'])
		# Paginate the unique friends list
		# users = self.paginate_queryset(unique_friends)
		# return Response(status=status.HTTP_200_OK)
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
	