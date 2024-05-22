from rest_framework.decorators import api_view
from .models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError


@api_view(["POST", "GET"])
def SignUp(request):
    if request.method == "GET":
        users = CustomUser.objects.all()
        seriaze_user = UserSerializer(users, many=True)
        return Response(seriaze_user.data, status=status.HTTP_200_OK)

    if request.method == "POST":
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
                httponly=True,
                samesite="Lax",
                # expiration date
                max_age=30 ,  # 30 seconds
            )
            response.status_code = status.HTTP_201_CREATED
            return response
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
			max_age=60 * 60 * 24 * 7# 7 days
		)
		response.set_cookie(
			key="access_token",
			value=str(refresh.access_token),
			httponly=True,
			samesite="Lax",#??
			max_age=30
		)
		response.status_code = status.HTTP_200_OK
		return response
	return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def Verify_Token(request):
    refresh_token = request.COOKIES.get("refresh_token")

    if not refresh_token:
        return Response(
			{"error": "refresh token not found"},
			status=status.HTTP_401_UNAUTHORIZED,
		)

    try:
        refresh = RefreshToken(refresh_token)
    except TokenError:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    try:
        AccessToken(refresh.access_token)
    except TokenError:
        new_access_token = RefreshToken(refresh_token).access_token
        response = Response()
        response.set_cookie(
            key="access_token",
            value=str(new_access_token),
            httponly=True,
            samesite="Lax",
            max_age=60 * 5,  # 5 minutes
        )
        response.status_code = status.HTTP_200_OK
        return response
    return Response({"message": "Tokens Still valid"}, status=status.HTTP_200_OK)

def default(request):
    h1 = "<h1>Welcome to the default page</h1>"
    return HttpResponse(h1)
