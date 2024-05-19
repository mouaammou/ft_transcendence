from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
	path("signup/",views.SignUp, name="singup"),
	path("login/",views.Login, name="login"),
	path("",views.default, name="default"),

	path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
	path("token/verify/", views.Verify_Token, name="token_verify"),
]
