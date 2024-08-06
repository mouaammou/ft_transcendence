from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView, TokenVerifyView
from .views import OAuth42Login, OAuth42Callback
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import UserProfile, UpdateProfile

from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
	path("signup",views.SignUp.as_view(), name="singup"),
	path("login",views.Login.as_view(), name="login"),
	path("logout",views.Logout.as_view(), name="logout"),
	path("", views.default, name="default"),
	#for admin

	path("token", TokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
	path("token/verify", views.Verify_Token, name="token_verify"),

	path('auth/login/42', OAuth42Login.as_view(), name='42_login'),
	path('auth/callback/42', OAuth42Callback.as_view(), name='42_callback'),

	#user profile, get and update, delete
	path("profile/data",views.UserProfile, name="profile"),
	path("profile/update",UpdateProfile, name="update profile"),
]

urlpatterns = format_suffix_patterns(urlpatterns)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)