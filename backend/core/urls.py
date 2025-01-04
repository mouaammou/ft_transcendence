from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
	path('backend/game/', include('game.urls')),
 
	# path('play/', include('tournament.urls')),
	path('backend/', include("authentication.urls")),
	# path('backend/admin/', admin.site.urls),
	path('backend/', include("chat.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
