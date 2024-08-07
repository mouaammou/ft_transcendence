from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from authentication.utils import set_jwt_cookies
from django.http import JsonResponse
from rest_framework.response import Response

class TokenVerificationMiddleWare:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		unrestricted_paths = [
			"/auth/login/42", "/auth/callback/42",
			"/signup", "/login", "/logout",
			"/token", "/token/refresh",
		]

		if request.path.startswith("/admin") or request.path in unrestricted_paths:
			return self.get_response(request)

		refresh_token = request.COOKIES.get("refresh_token")
		access_token = request.COOKIES.get("access_token")

		if not refresh_token:
			return JsonResponse(
				{"error": "refresh token not found or access token not found"},
				status=status.HTTP_401_UNAUTHORIZED,
			)
		try:
			RefreshToken(refresh_token)
			try:
				if not access_token:
					raise TokenError
				AccessToken(access_token)
			except TokenError:
				new_access_token = str(RefreshToken(refresh_token).access_token)
				request.COOKIES["access_token"] = new_access_token

				response = self.get_response(request)

				response.set_cookie("access_token", new_access_token)
				return response
		except TokenError:
			return JsonResponse({"error": "refresh token invalid"}, status=status.HTTP_401_UNAUTHORIZED)
		return self.get_response(request)