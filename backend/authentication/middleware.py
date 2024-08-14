from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from authentication.utils import set_jwt_cookies
from django.http import JsonResponse

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
		# if not refresh_token or not access_token:
		# 	return JsonResponse(
		# 		{"error": "refresh token not found or access token not found"},
		# 		status=status.HTTP_401_UNAUTHORIZED,
		# 	)
		try:
			RefreshToken(refresh_token)
			try:
				AccessToken(access_token)
			except TokenError:
				response = JsonResponse({"message": "Access token refreshed"}, status=status.HTTP_200_OK)
				response = set_jwt_cookies(response, RefreshToken(refresh_token))
				return response
		except TokenError:
			return JsonResponse({"error": "refresh token invalid"}, status=status.HTTP_401_UNAUTHORIZED)
		return self.get_response(request)