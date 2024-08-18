from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from authentication.serializers import UserSerializer, UserUpdateSerializer
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

User = get_user_model()

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
			return Response({"success":"updated sucessfully", "avatar": serializer.data['avatar']}, status=status.HTTP_200_OK)
		return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)  # Use 400 for validation errors