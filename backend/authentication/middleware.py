from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from authentication.utils import set_jwt_cookies
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()
 
# class TokenVerificationMiddleWare(MiddlewareMixin):
# 	def process_request(self, request):
# 		refresh_token = request.COOKIES.get("refresh_token")
# 		access_token = request.COOKIES.get("access_token")
		# if not refresh_token or not access_token:
		# 	return Response(
		# 		{"error": "refresh token not found or access token not found"},
		# 		status=status.HTTP_401_UNAUTHORIZED,
		# 	)
		# try:
		# 	RefreshToken(refresh_token)
		# 	try:
		# 		AccessToken(access_token)
		# 	except TokenError:
		# 		response = set_jwt_cookies(Response(), refresh_token)
		# 		response.status_code = status.HTTP_200_OK
		# 		response.data = {"message": "Access token refreshed"}
		# 		return response
		# except TokenError:
		# 	return Response({"error": "refresh token invalid"}, status=status.HTTP_401_UNAUTHORIZED)

		# return JsonResponse(
		# 	{"message": "Tokens Still valid"},
		# 	status=status.HTTP_200_OK,
		# )

class TokenVerificationMiddleWare:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		request_path = request.path
		if request_path == "/auth/login/42" or request_path == "/auth/callback/42" or \
			request_path == "/signup" or request_path == "/login" or request_path == "/logout" \
			or request_path == "/token" or request_path == "/token/refresh":
			return self.get_response(request)
		#if the request starts with admin
		if request_path.startswith("/admin"):
			return self.get_response(request)
		refresh_token = request.COOKIES.get("refresh_token")
		access_token = request.COOKIES.get("access_token")
		if not refresh_token or not access_token:
			return JsonResponse(
				{"error": "refresh token not found or access token not 999 found"},
				status=status.HTTP_401_UNAUTHORIZED,
			)
		try:
			RefreshToken(refresh_token)
			# try:
			# 	user = User.objects.get(id=RefreshToken(refresh_token).payload.get("user_id"))
			# 	# request.customuser = user
			# except User.DoesNotExist:
			# 	request.customuser = AnonymousUser()
			# 	print(f"user -- : {request.customuser}")
			try:
				AccessToken(access_token)
			except TokenError:
				response = set_jwt_cookies(JsonResponse(), refresh_token)
				response.status_code = status.HTTP_200_OK
				response.data = {"message": "Access token refreshed"}
				return response
		except TokenError:
			return JsonResponse({"error": "refresh token invalid"}, status=status.HTTP_401_UNAUTHORIZED)

		return JsonResponse(
			{"message": "Tokens Still valid"},
			status=status.HTTP_200_OK,
		)