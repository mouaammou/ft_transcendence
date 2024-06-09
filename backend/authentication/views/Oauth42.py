import requests
from django.conf import settings
from rest_framework.views import APIView
from authentication.models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password
from authentication.utils import set_jwt_cookies
from authentication.serializers import UserSerializer

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
			"avatar_url":user_data['image']['versions']['medium']
		}

		response = Response()
		try:
			user = CustomUser.objects.get(username=user_data['login'])
			response.status = status.HTTP_200_OK
		except CustomUser.DoesNotExist:
			try:
				user = CustomUser.objects.create(**user_data_set)
				random = CustomUser.objects.make_random_password()
				user.set_password(make_password(random))
				user.save()
				response.status = status.HTTP_201_CREATED
			except Exception as e:
				return Response({"error": f"Failed to create user: {e}"}, status=status.HTTP_400_BAD_REQUEST)
		response = set_jwt_cookies(response, RefreshToken.for_user(user))
		return response