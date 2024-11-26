import requests
import logging
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from authentication.utils import set_jwt_cookies
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken


from authentication.totp.views import get_2fa_cookie_token_for_user

import hmac
import hashlib
import base64


CustomUser = get_user_model()
logger = logging.getLogger(__name__)

import hmac
import hashlib
import base64
import time
from rest_framework.views import APIView
from rest_framework.response import Response


class OAuth42Login(APIView):
	def get(self, request):
		try:
			redirect_uri = settings.OAUTH42_REDIRECT_URI
			client_id = settings.OAUTH42_CLIENT_ID
			auth_url = f"{settings.OAUTH42_AUTH_URL}?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
			response = Response(data={"auth_url": auth_url} ,status=status.HTTP_200_OK)
		except Exception as e:
			logger.error(f"\nError on auth/login/42: {e}\n")
		return response



class OAuth42Callback(APIView):

	def get(self, request):
		response = Response()
		try:
			code = request.GET.get('code')
			if not code:
				logger.error(f"\nError 42Oauth: Parameter Code not provided\n")
				return Response({"Error": "Code not provided"}, status=status.HTTP_400_BAD_REQUEST)

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
				logger.error(f"\nError 42Oauth: Failed to obtain access token\n")
				return Response({"Error": "Failed to obtain access token"}, status=status.HTTP_400_BAD_REQUEST)

			access_token = token_response_data['access_token']
			user_response = requests.get(settings.OAUTH42_USER_URL, headers={'Authorization': f'Bearer {access_token}'})
			user_data = user_response.json()

			user_data_set = {
				"username":user_data['login'],
				"user42":user_data['login'],
				"first_name":user_data['first_name'],
				"last_name":user_data['last_name'],
				"email":user_data['email'],
			}
			avatar_url = user_data['image']['versions']['medium']

			try:
				user = CustomUser.objects.get(user42=user_data['login'])
				response.status = status.HTTP_200_OK
				response.data = {"success":"already exists"}
				if user is not None and user.totp_enabled:
					response.data = {"totp":"2fa verification is required!"}
					cookie_data = get_2fa_cookie_token_for_user(user.id)
					response.set_cookie(**cookie_data)
					return response
					
			except CustomUser.DoesNotExist:
				try:
					user = CustomUser.objects.create(**user_data_set)
					random = CustomUser.objects.make_random_password()
					user.set_password(make_password(random))
					user.download_and_save_image(avatar_url)
					user.save()
					response.status = status.HTTP_201_CREATED
				except Exception as e:
					logger.error(f"\nError 42Oauth: Failed to create user {e}\n")
					return Response({"Error": f"Failed to create user: {e}"}, status=status.HTTP_400_BAD_REQUEST)
			response = set_jwt_cookies(response, RefreshToken.for_user(user))
			return response
		except Exception as e:
			logger.error(f"Error 42Oauth: get() method: {e}")
			return Response({"Error": f"Failed to create user: {e}"}, status=status.HTTP_400_BAD_REQUEST)