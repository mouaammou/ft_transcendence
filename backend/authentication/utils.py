#import get_user_model
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import AnonymousUser
from django.core.files.base import ContentFile
from .models import CustomUser
from rest_framework_simplejwt.settings import api_settings

User = get_user_model()

def set_jwt_cookies(response, refresh):
	response.set_cookie(
		key="refresh_token",
		value=str(refresh),
		httponly=True,
		samesite="Lax",#??
		max_age= api_settings.REFRESH_TOKEN_LIFETIME,  # 7 days
	)
	response.set_cookie(
		key="access_token",
		value=str(refresh.access_token),
		samesite="Lax",#??
		httponly=True,
		max_age= api_settings.ACCESS_TOKEN_LIFETIME,  # 24 hours
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
					# serialize_user = UserSerializer(myuser, many=False).data
					request.customuser = myuser
				except User.DoesNotExist:
					request.customuser = AnonymousUser()
			except TokenError:
				request.customuser = AnonymousUser()
		except TokenError:
			request.customuser = AnonymousUser()
		return func(request,*args, **kwargs)
	return wrapper

def save_image_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        content = ContentFile(response.content)
        file_name = "downloaded_image.jpg"
        my_model_instance = CustomUser(image_file=content, image_name=file_name)
        my_model_instance.save()