from django.contrib import admin
from django.urls import path, include

urlpatterns = [
	path('backend/game/', include('game.urls')),
 
	# path('play/', include('tournament.urls')),
	path('backend/', include("authentication.urls")),
	path('backend/admin/', admin.site.urls),
	path('backend/', include("chat.urls")),
]
