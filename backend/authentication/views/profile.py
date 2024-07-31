from rest_framework.decorators import api_view
from authentication.models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from authentication.serializers import UserSerializer, ImageSerializer
from authentication.utils import has_valid_token
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView

@api_view(["POST", "GET"])
@has_valid_token
def UserProfile(request):
	print(f"request cookies:: ", request.COOKIES.get("refresh_token"))
	user = UserSerializer(request.customuser, many=False).data
	return Response({"user": user}, status=status.HTTP_200_OK)

@api_view(["POST"])
@has_valid_token
def UpdateProfile(request):
	user = request.customuser
	try:
		user = CustomUser.objects.get(username=user.username)
	except CustomUser.DoesNotExist:
		return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
	
	print(f"request data {request.data}")
	user_serializer = UserSerializer(user, data=request.data, partial=True)
	if user_serializer.is_valid():
		user_updated = user_serializer.update(user, user_serializer.validated_data)
		if user_updated.avatar:
			user_updated.avatar_url = f"http://localhost:8000{settings.MEDIA_URL}{user_updated.avatar}"
		user_updated.save()
		return Response(user_serializer.data, status=status.HTTP_200_OK)

	# avatar_serializer = ImageSerializer(data=request.data)
	# if avatar_serializer.is_valid():
	# 	user_updated = avatar_serializer.update(user, avatar_serializer.validated_data)
	# 	user_updated.avatar_url = f"http://localhost:8000{settings.MEDIA_URL}{user_updated.avatar}"
	# 	user_updated.save()
	# 	return Response(status=status.HTTP_200_OK)

	return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
