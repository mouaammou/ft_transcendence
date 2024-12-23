from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.tokens import AccessToken, TokenError
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from channels.exceptions import DenyConnection
from django.http import JsonResponse
from rest_framework import status
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class TokenVerificationMiddleWare:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		unrestricted_paths = [
			"/auth/login/42", "/auth/callback/42",
			"/signup", "/login", "/logout",
			"/token", "/token/refresh",
			"/reset-password","/forgot-password",
			'/2fa/verify/user/', '/2fa/verify/user',
		]
		request.customUser = AnonymousUser()
		# request.jwt_payload = {}
		if request.path.startswith("/admin") or request.path in unrestricted_paths:
			# print("----> ", f"|{request.path}|");
			return self.get_response(request)  # Proceed with the request

		refresh_token = request.COOKIES.get("refresh_token")
		access_token = request.COOKIES.get("access_token")

		if not refresh_token:
			return JsonResponse(
					{"error": "refresh token not found or invalid"},
					status=status.HTTP_401_UNAUTHORIZED,
			)

		try:
			refresh_token_obj = RefreshToken(refresh_token)
			# print('x'*15)
			# print(refresh_token_obj.payload)
			# print('x'*15)
			request.unique_key = refresh_token_obj.payload.get("channel_name")
			# request.jwt_payload = refresh_token_obj.payload
			if not access_token:
					# Generate a new access token if none exists or is invalid
					new_access_token = refresh_token_obj.access_token

					user_id = AccessToken(new_access_token).get("user_id")
					request.customUser = User.objects.get(id=user_id)
					# request.jwt_payload = refresh_token_obj.payload
					# request.user = User.objects.get(id=user_id)

					response = self.get_response(request)
					response.set_cookie(
						key="access_token",
						value=str(new_access_token),
						httponly=True,
						samesite="Lax",#??
						max_age= api_settings.ACCESS_TOKEN_LIFETIME,  # 7 days
					)
					return response

			# Validate the access token
			try:
					user_id = AccessToken(access_token).get("user_id")
					request.customUser = User.objects.get(id=user_id)
					return self.get_response(request)
			except (TokenError, User.DoesNotExist):
					# If access token is invalid, create a new one
					new_access_token = refresh_token_obj.access_token

					user_id = AccessToken(new_access_token).get("user_id")
					request.customUser = User.objects.get(id=user_id)

					

					response = self.get_response(request)
					response.set_cookie(
						key="access_token",
						value=str(new_access_token),
						httponly=True,
						samesite="Lax",#??
						max_age= api_settings.ACCESS_TOKEN_LIFETIME,  # 7 days
					)
					return response
		except TokenError:
			response = JsonResponse({"error": "refresh token invalid"}, status=status.HTTP_401_UNAUTHORIZED)
			response.delete_cookie("refresh_token")
			response.delete_cookie("access_token")
			return response

		return self.get_response(request)  # Proceed with the request


class UserOnlineStatusMiddleware(BaseMiddleware):
	async def __call__(self, scope, receive, send):
		try:
			headers = dict(scope["headers"])
			access_token = None

			if b'cookie' in headers:
					cookie_str = headers[b'cookie'].decode('utf-8')
					cookies_dict = dict(cookie.split('=', 1) for cookie in cookie_str.split('; '))
					access_token = cookies_dict.get('access_token')
			
			if not access_token:
					scope['user'] = AnonymousUser()
			try:
					user = await self.get_user_from_token(str(access_token))
					scope['user'] = user
			except TokenError:
					scope['user'] = AnonymousUser()

			if isinstance(scope['user'], AnonymousUser):
					raise DenyConnection("Authentication Required !")
		except Exception as e:
			logger.error(f"\nConnection Denied: {e}\n")
		return await super().__call__(scope, receive, send)

	@database_sync_to_async
	def get_user_from_token(self, token):
		try:
			user_id = AccessToken(token).get("user_id")
			user = User.objects.get(id=user_id)
			return user
		except (TokenError, User.DoesNotExist):
			raise TokenError("token is not valid")
