from rest_framework.decorators import api_view
from .models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError


@api_view(["POST"])
def SignUp(request):
	seriaze_user = UserSerializer(data=request.data)

	if seriaze_user.is_valid():
		user = seriaze_user.save()
		refresh = RefreshToken.for_user(user)  # Create a refresh token for the user
		response = Response()
		response.set_cookie(
			key="refresh_token",
			value=str(refresh),
			httponly=True,
			samesite="Lax",
			max_age=60 * 60 * 24 * 7,  # 7 days
		)
		response.set_cookie(
			key="access_token",
			value=str(refresh.access_token),
			samesite="Lax",
			httponly=True,
			max_age=60 * 60 * 24, # 24 hours
		)
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
		response = Response()
		response.set_cookie(
			key="refresh_token",
			value=str(refresh),
			httponly=True,
			samesite="Lax",#??
			max_age= 60 * 60 * 24 * 7,  # 7 days
		)
		response.set_cookie(
			key="access_token",
			value=str(refresh.access_token),
			samesite="Lax",#??
			httponly=True,
			max_age=60 * 60 * 24,  # 24 hours
		)
		response.status_code = status.HTTP_200_OK
		return response
	return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def Verify_Token(request):
	refresh_token = request.COOKIES.get("refresh_token")
	access_token = request.COOKIES.get("access_token")
	if not refresh_token:
		return Response(
			{"error": "refresh token not found or access token not found"},
			status=status.HTTP_401_UNAUTHORIZED,
		)
	try:
		RefreshToken(refresh_token)
		try:
			AccessToken(access_token)
		except TokenError:
			new_access_token = RefreshToken(refresh_token).access_token
			response = Response()
			response.set_cookie(
				key="access_token",
				value=str(new_access_token),
				samesite="Lax",
				httponly=True,
				max_age=60 * 60 * 24,  # 5 hours
			)
			response.status_code = status.HTTP_200_OK
			response.data = {"message": "Access token refreshed"}
			return response
	except TokenError:
		return Response({"error": "refresh token invalid"}, status=status.HTTP_401_UNAUTHORIZED)

	return Response(
		{"message": "Tokens Still valid"},
		status=status.HTTP_200_OK,
	)

@api_view(["POST"])
def Logout(request):
	response = Response()
	response.delete_cookie("refresh_token")
	response.delete_cookie("access_token")
	response.status_code = status.HTTP_205_RESET_CONTENT
	response.data = {"message": "Logout successfully"}
	return response

def default():
    h1 = "<h1>Welcome to the default page</h1>"
    return HttpResponse(h1)



