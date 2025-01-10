from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from authentication.serializers import UserSerializer, UserUpdateSerializer
from rest_framework.views import APIView
from django.db.models import Q
from authentication.models import Friendship
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class UserProfile(APIView):
	def post(self, request):
		user = UserSerializer(request.customUser).data
		return Response({"user": user}, status=status.HTTP_200_OK)

class UpdateProfile(APIView):
	def post(self, request):
		user = request.customUser
		try:
			user_instance = User.objects.get(id=user.id)
		except User.DoesNotExist:
			return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

		serializer = UserUpdateSerializer(user_instance, data=request.data, partial=True)
		if serializer.is_valid():
			password = request.data.get('password')
			if password:
				password = user_instance.set_password(password)
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)  # Use 400 for validation errors

class GetUserById(APIView):
	def get (self, request, id):
		try:
			user = User.objects.get(id=id)
			serializer = UserSerializer(user)
			return Response(serializer.data, status=status.HTTP_200_OK)
		except User.DoesNotExist:
			return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class FriendProfile(generics.GenericAPIView):

	def get(self, request, *args, **kwargs):
		# Get the username from the URL
		if 'username' not in kwargs:
			logger.error("\nError: Username not provided\n")
			return Response({"Error": "Username not provided"}, status=status.HTTP_400_BAD_REQUEST)

		try:
			user = User.objects.get(username=kwargs['username'])
			serializer = UserSerializer(user, partial=True)
			
			# Check if the current user is a friend of the profile user
			current_user = request.customUser
			friendship = Friendship.objects.filter(
					(Q(sender=current_user) & Q(receiver=user)) |
					(Q(sender=user) & Q(receiver=current_user))
			).first()

			# Determine the friend status
			if friendship:
				if friendship.sender == current_user:
					friend_status = friendship.status
				else:
					friend_status = friendship.received_status
			else:
				friend_status = "no"

			response_data = serializer.data
			response_data['friend'] = friend_status

		except User.DoesNotExist:
			logger.error("\nError: User not found\n")
			return Response({"Error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

		return Response(response_data, status=status.HTTP_200_OK)


class FriendProfileId(generics.GenericAPIView):

	def get (self, request, id):
		try:
			user = User.objects.get(id=id)
			serializer = UserSerializer(user)
			return Response(serializer.data, status=status.HTTP_200_OK)
		except User.DoesNotExist:
			return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

