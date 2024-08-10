from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, permissions
from authentication.serializers import UserSerializer, ImageSerializer
from django.conf import settings
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from authentication.utils import has_valid_token

CustomUser = get_user_model()

@api_view(["POST"])
@has_valid_token
def UserProfile(request):
	user = UserSerializer(request.user).data
	return Response({"user": user}, status=status.HTTP_200_OK)

@api_view(["POST"])
@has_valid_token
def UpdateProfile(request):

	user = request.user

	print(f"\n--- {user} --\n")
	try:
		user_instance = CustomUser.objects.get(id=user.id)
	except CustomUser.DoesNotExist:
		return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

	print(f"\n--- error here --\n")
	serializer = UserSerializer(user_instance, data=request.data, partial=True)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status=status.HTTP_200_OK)
	else:
		return Response(status=444)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)