from rest_framework.decorators import api_view
from authentication.models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from authentication.serializers import UserSerializer
from authentication.utils import has_valid_token
from django.conf import settings

@api_view(["POST", "GET"])
@has_valid_token
def UserProfile(request):
	print(f"\nUser: {request.customuser}\n")
	return Response({"user": request.customuser}, status=status.HTTP_200_OK)

@api_view(["POST"])
@has_valid_token
def UpdateProfile(request):
	print(f"Media Root Path: {settings.MEDIA_ROOT}")
	#get the id of the user
	serializer = UserSerializer(request.customuser)
	id = serializer.data['id']
	#update the user
	try:
		user = CustomUser.objects.get(id=id)
		if request.data.get("first_name"):
			user.first_name = request.data.get("first_name")
		if request.data.get("last_name"):
			user.last_name = request.data.get("last_name")
		if request.data.get("username"):
			user.username = request.data.get("username")
		if request.data.get("email"):
			user.email = request.data.get("email")
		if request.data.get("avatar"):
			user.avatar = request.data.get("avatar")
		user.save()
		print(f"\nUser: {user.avatar}\n")
	except CustomUser.DoesNotExist:
		return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

	return Response({"user": "user is updated"}, status=status.HTTP_200_OK)
