#import get_user_model
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import AnonymousUser
from django.core.files.base import ContentFile
from .models import CustomUser
from rest_framework_simplejwt.settings import api_settings

import uuid

User = get_user_model()

def set_jwt_cookies(response, refresh):
	print('+L'*20)
	print(refresh.payload)
	print('L+'*20)
	if refresh.get('channel_name') is None:
		refresh['channel_name'] = str(uuid.uuid4())
	response.set_cookie(
		key="refresh_token",
		value=str(refresh),
		httponly=True,
		samesite="Lax",#??
		max_age= api_settings.REFRESH_TOKEN_LIFETIME,  # 7 days
	)
	access_token = refresh.access_token
	# access_token['unique_key'] = refresh['unique_key']
	response.set_cookie(
		key="access_token",
		value=str(access_token),
		samesite="Lax",#??
		httponly=True,
		max_age= api_settings.ACCESS_TOKEN_LIFETIME,  # 24 hours
	)
	return response

def save_image_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        content = ContentFile(response.content)
        file_name = "downloaÍded_image.jpg"
        my_model_instance = CustomUser(image_file=content, image_name=file_name)
        my_model_instance.save()


# def has_valid_token(func):
# 	def wrapper(request, *args, **kwargs):
# 		try:
# 			myuser = User.objects.get(id=AccessToken(request.COOKIES.get("access_token")).get("user_id"))
# 			request.user = myuser
# 		except User.DoesNotExist:
# 			request.user = AnonymousUser()
# 		return func(request,*args, **kwargs)
# 	return wrapper