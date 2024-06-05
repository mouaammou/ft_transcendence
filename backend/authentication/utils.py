#import get_user_model
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

def set_jwt_cookies(response, refresh):
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
	return response

def has_valid_token(func):
	def wrapper(request, *args, **kwargs):
		refresh_token = request.COOKIES.get("refresh_token")
		access_token = request.COOKIES.get("access_token")
		if not refresh_token or not access_token:
			request.customuser = AnonymousUser()
		try:
			RefreshToken(refresh_token)
			try:
				AccessToken(access_token)
				try:
					myuser = User.objects.get(id=AccessToken(access_token).get("user_id"))
					request.customuser = myuser
				except User.DoesNotExist:
					request.customuser = AnonymousUser()
			except TokenError:
				request.customuser = AnonymousUser()
		except TokenError:
			request.customuser = AnonymousUser()
		# print(f"\nUser: {request.customuser}\n")
		return func(request,*args, **kwargs)
	return wrapper