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

# def has_valid_token(request):
# 	if (request.customuser.is_authenticated):
# 		return True
# 	return True 

# decorator to check if the user has a valid token
# def has_valid_token(func):
# 	def wrapper(request, *args, **kwargs):
# 		refresh_token = request.COOKIES.get("refresh_token")
# 		access_token = request.COOKIES.get("access_token")
# 		if not refresh_token or not access_token:
# 			return False
# 		try:
# 			RefreshToken(refresh_token)
# 			try:
# 				AccessToken(access_token)
# 			except TokenError:
# 				return False
# 		except TokenError:
# 			return False
# 		return func(request, *args, **kwargs)
# 	return wrapper