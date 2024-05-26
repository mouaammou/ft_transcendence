from rest_framework.decorators import api_view
from .models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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
				httpOnly=True,
                samesite="Lax",
                max_age=60 * 60 * 24 * 7,  # 7 days
            )
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                samesite="Lax",
                max_age=30 ,  # 30 seconds
            )
            response.set_cookie(
                key="username",
                value=user.username,
				httpOnly=True,
                samesite="Lax",
                max_age=60 * 60 * 24 * 7,  # 7 days
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
			httpOnly=True,
			samesite="Lax",#??
			max_age= 60 * 60 * 24 * 7,  # 7 days
		)
		response.set_cookie(
			key="access_token",
			value=str(refresh.access_token),
			samesite="Lax",#??
			max_age=30  # 30 seconds
		)
		response.set_cookie(
				key="username",
				value=user.username,
				samesite="Lax",
				httpOnly=True,
				max_age=60 * 60 * 24 * 7,  # 7 days
			)
		response.status_code = status.HTTP_200_OK
		return response
	return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def Verify_Token(request):
	refresh_token = request.COOKIES.get("refresh_token")
	username = request.COOKIES.get("username")
	if not refresh_token or not username:
		return Response(
			{"error": "refresh token not found or username not found"},
			status=status.HTTP_401_UNAUTHORIZED,
		)

	try:
		refresh = RefreshToken(refresh_token)
	except TokenError:
		return Response(status=status.HTTP_401_UNAUTHORIZED)
	try:
		access_token = AccessToken(refresh.access_token)
		token_username = access_token["username"]
		print(f"--> username: {username}")
		if token_username != username:
			return Response(
				{"error": "username does not match"},
				status=status.HTTP_401_UNAUTHORIZED,
			)
	except TokenError:
		new_access_token = RefreshToken(refresh_token).access_token
		response = Response()
		response.set_cookie(
			key="access_token",
			value=str(new_access_token),
			samesite="Lax",
			max_age=60 * 5,  # 5 minutes
		)
		response.status_code = status.HTTP_200_OK
		return response
	return Response({"message": "Tokens Still valid", "username": token_username}, status=status.HTTP_200_OK)


@api_view(["POST"])
def Logout(request):
	response = Response()
	response.delete_cookie("refresh_token")
	response.delete_cookie("access_token")
	response.delete_cookie("username")
	response.status_code = status.HTTP_205_RESET_CONTENT
	response.data = {"message": "Logout successfully"}
	return response

def default(request):
    h1 = "<h1>Welcome to the default page</h1>"
    return HttpResponse(h1)



