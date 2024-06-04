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