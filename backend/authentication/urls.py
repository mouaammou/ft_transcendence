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
	path('friends', views.FriendshipListView.as_view(), name='friendship-list-create'),
	path('friends/<int:pk>/', views.FriendshipRetrieveUpdateDestroyView.as_view(), name='friendship-detail'),
	# path('friends/<int:pk>/accept/',views. AcceptFriendshipView.as_view(), name='friendship-accept'),
	path('blockFriend/<int:pk>', views.BlockFriendshipView.as_view(), name='friendship-block'),
	# remove friend
	path('removeFriend/<int:pk>', views.RemoveFriend.as_view(), name='remove friend'),
	
	# for notificaions
	path('notifications', views.ListNotifications.as_view(), name="notifications"),
	# for unread notifications
	path('notifications/unread', views.UnreadNotifications.as_view(), name="unread notifications"),
	# mark notification as read
	path('notifications/<int:pk>/read', views.MarkNotificationRead.as_view(), name="mark notification as read"),
	# accept or reject friend request
	path('notifications/acceptFriend', views.AcceptFriendRequest.as_view(), name="accept friend request"),

	#for pending notifications for friendship
	path('notifications/pending', views.PendingFrienshipRequest.as_view(), name="pending friend request"),

	
	# for all users
	path("allusers", views.AllUser.as_view(), name="all users"),

	# for Friend profile
	path("friendProfile/<str:username>", views.FriendProfile.as_view(), name="friend profile"),
	path("userById/<int:id>", views.GetUserById.as_view(), name="friend profile"),

	# for search
	path("searchItems/<str:searchedQuery>", views.SearchClass.as_view(), name="search"),

]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)