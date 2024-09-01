from . import views
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView


urlpatterns = [
	path("signup",views.SignUp.as_view(), name="singup"),
	path("login",views.Login.as_view(), name="login"),
	path("logout",views.Logout.as_view(), name="logout"),
	path("", views.default, name="default"),
    
	path('verifyTokens', views.VerifyToken.as_view(), name='verify token'),
	#for admin

	path("token", TokenObtainPairView.as_view(), name="token_obtain_pair"),
	path("token/refresh", TokenRefreshView.as_view(), name="token_refresh"),

	path('auth/login/42', views.OAuth42Login.as_view(), name='42_login'),
	path('auth/callback/42', views.OAuth42Callback.as_view() , name='42_callback'),

	#user profile, get and update, delete
	path("profile/data", views.UserProfile.as_view(), name="profile"),
	path("profile/update",views.UpdateProfile.as_view(), name="update profile"),
    
	# for friends
    path('friends/', views.FriendshipListCreateView.as_view(), name='friendship-list-create'),
    path('friends/<int:pk>/', views.FriendshipRetrieveUpdateDestroyView.as_view(), name='friendship-detail'),
    path('friends/<int:pk>/accept/',views. AcceptFriendshipView.as_view(), name='friendship-accept'),
    path('friends/<int:pk>/block/', views.BlockFriendshipView.as_view(), name='friendship-block'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)