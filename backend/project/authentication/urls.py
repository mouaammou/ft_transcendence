from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .views import OAuth42Login, OAuth42Callback

from . import views

urlpatterns = [
	path("signup/",views.SignUp, name="singup"),
	path("login/",views.Login, name="login"),
	path("logout/",views.Logout, name="logout"),
	path("",views.default, name="default"),

	path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
	path("token/verify/", views.Verify_Token, name="token_verify"),

	path('auth/login/42/', OAuth42Login.as_view(), name='42_login'),
    path('auth/callback/42/', OAuth42Callback.as_view(), name='42_callback'),
]
