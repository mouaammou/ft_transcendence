from rest_framework.decorators import api_view
from authentication.models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from authentication.serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.utils import set_jwt_cookies
from authentication.utils import has_valid_token

@api_view(["POST", "GET"])
def SignUp(request):
	if request.method == "GET":
		try:
			all_users = CustomUser.objects.all()
			seriaze_user = UserSerializer(all_users, many=True)
			return Response(seriaze_user.data)
		except Exception as e:
			return Response({"Error": str(e)})

	seriaze_user = UserSerializer(data=request.data)
	if seriaze_user.is_valid():
		user = seriaze_user.save()
		refresh = RefreshToken.for_user(user)  # Create a refresh token for the user
		response = set_jwt_cookies(Response(), refresh)
		response.status_code = status.HTTP_201_CREATED
		return response
	else:
		return Response(seriaze_user.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def Login(request):
	username = request.data.get("username")
	password = request.data.get("password")

	if username == "" or password == "":
		return Response(
			{"error": "Please provide both username and password"},
			status=status.HTTP_400_BAD_REQUEST,
		)

	user = authenticate(username=username, password=password)

	if user is not None:
		refresh = RefreshToken.for_user(user)
		response = set_jwt_cookies(Response(), refresh)
		response.status_code = status.HTTP_200_OK
		return response
	return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def Logout(request):
	response = Response()
	response.delete_cookie("refresh_token")
	response.delete_cookie("access_token")
	#blacklist the refresh token
	refresh_token = request.COOKIES.get("refresh_token")
	blacklist = RefreshToken(refresh_token)
	blacklist.blacklist()
	response.status_code = status.HTTP_205_RESET_CONTENT
	response.data = {"message": "Logout successfully"}
	return response

@api_view(["POST"])
@has_valid_token
def Verify_Token(request):
	return Response(
		{"message": "Tokens Still valid"},
		status=status.HTTP_200_OK,
	)

