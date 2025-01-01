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
			"/backend/auth/login/42", "/backend/auth/callback/42",
			"/backend/signup", "/backend/login", "/backend/logout",
			"/backend/token", "/backend/token/refresh",
			"/backend/reset-password","/backend/forgot-password",
			'/backend/2fa/verify/user/', '/backend/2fa/verify/user',
		]
		request.customUser = AnonymousUser()
		# request.jwt_payload = {}
		if request.path.startswith("/backend/admin") or request.path in unrestricted_paths:
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


# class UserOnlineStatusMiddleware(BaseMiddleware):
class UserOnlineStatusMiddleware(BaseMiddleware):
	async def __call__(self, scope, receive, send):
		try:
			headers = dict(scope["headers"])
			access_token = None

			# Extract access token from cookies
			if b'cookie' in headers:
				cookie_str = headers[b'cookie'].decode('utf-8')
				try:
					cookies_dict = {}
					for cookie in cookie_str.split('; '):
						if '=' in cookie:
							name, value = cookie.split('=', 1)
							cookies_dict[name] = value
					access_token = cookies_dict.get('access_token')
				except Exception as e:
					logger.error(f"Cookie parsing error: {e}")
					access_token = None

			# Clear existing user from scope
			scope['user'] = AnonymousUser()

			# Only proceed with token validation if we have a token
			if access_token:
				try:
					# Validate token and get user
					user = await self.get_user_from_token(str(access_token))
					if user and user.is_active:
						scope['user'] = user
						logger.debug(f"Authenticated user: {user.username}")
					else:
						logger.debug("User not active or not found")
				except TokenError as e:
					logger.debug(f"Token validation failed: {e}")
				except Exception as e:
					logger.error(f"Unexpected error during token validation: {e}")

			# Check final authentication state
			if isinstance(scope['user'], AnonymousUser):
				logger.debug("Connection denied: User not authenticated")
				raise DenyConnection("Authentication Required!")

			return await super().__call__(scope, receive, send)

		except DenyConnection as e:
			# Re-raise DenyConnection
			raise
		except Exception as e:
			logger.error(f"Middleware error: {e}")
			raise DenyConnection(f"Connection error: {str(e)}")

	@database_sync_to_async
	def get_user_from_token(self, token):
		try:
			# Verify token and get user_id
			decoded_token = AccessToken(token)
			user_id = decoded_token.get("user_id")
			
			if not user_id:
				raise TokenError("Invalid token: no user_id found")

			# Get user from database
			user = User.objects.filter(id=user_id).first()
			if not user:
				raise User.DoesNotExist(f"User {user_id} not found")

			return user

		except TokenError as e:
			logger.debug(f"Token validation failed: {e}")
			raise
		except User.DoesNotExist as e:
			logger.debug(f"User lookup failed: {e}")
			raise
		except Exception as e:
			logger.error(f"Unexpected error in token validation: {e}")
			raise TokenError(f"Token validation failed: {str(e)}")
