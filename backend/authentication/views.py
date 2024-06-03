import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from .models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.http import HttpResponse
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.hashers import make_password

#import jsonResponse

@api_view(["POST", "GET"])
def SignUp(request):
	if request.method == "GET":
		try:
			all_users = CustomUser.objects.all()
			seriaze_user = UserSerializer(all_users, many=True)
			return Response(seriaze_user.data)
		except Exception as e:
			return Response({"error": str(e)})

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
	#blacklist the refresh token
	refresh_token = request.COOKIES.get("refresh_token")
	blacklist = RefreshToken(refresh_token)
	blacklist.blacklist()
	response.status_code = status.HTTP_205_RESET_CONTENT
	response.data = {"message": "Logout successfully"}
	return response

def default(request):
    h1 = "<h1>Welcome to the default page</h1>"
    return HttpResponse(h1)

class OAuth42Login(APIView):
	def get(self, request):
		redirect_uri = settings.OAUTH42_REDIRECT_URI
		client_id = settings.OAUTH42_CLIENT_ID
		auth_url = f"{settings.OAUTH42_AUTH_URL}?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
		response = Response(data={"auth_url": auth_url} ,status=status.HTTP_200_OK)
		return response

class OAuth42Callback(APIView):	
	def get(self, request):
		code = request.GET.get('code')
		if not code:
			return Response({"error": "Code not provided"}, status=status.HTTP_400_BAD_REQUEST)
		
		token_data = {
			'grant_type': 'authorization_code',
			'client_id': settings.OAUTH42_CLIENT_ID,
			'client_secret': settings.OAUTH42_CLIENT_SECRET,
			'code': code,
			'redirect_uri': settings.OAUTH42_REDIRECT_URI,
		}
		
		token_response = requests.post(settings.OAUTH42_TOKEN_URL, data=token_data)
		token_response_data = token_response.json()

		if 'access_token' not in token_response_data:
			return Response({"error": "Failed to obtain access token"}, status=status.HTTP_400_BAD_REQUEST)

		access_token = token_response_data['access_token']
		user_response = requests.get(settings.OAUTH42_USER_URL, headers={'Authorization': f'Bearer {access_token}'})
		user_data = user_response.json()

		user_data_set = {
			"username":user_data['login'],
			"first_name":user_data['first_name'],
			"last_name":user_data['last_name'],
			"email":user_data['email'],
		}

		user, created = CustomUser.objects.get_or_create(username=user_data['login'], defaults=user_data_set)
		response = Response()
		if created:
			random = CustomUser.objects.make_random_password()
			user.set_password(make_password(random))
			response.status = status.HTTP_201_CREATED
			user.save()
		else:
			response.status = status.HTTP_200_OK
		refresh = RefreshToken.for_user(user)
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
			max_age=60 * 30,  # 30 minutes
		)
		response.data = {"message": "User logged in successfully"}
		return response
