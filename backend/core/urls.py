from django.contrib import admin
from django.urls import path, include
<<<<<<< HEAD

=======
>>>>>>> game

urlpatterns = [
    path('game/', include('game.urls')),
    # path('play/', include('tournament.urls')),
    path('', include("authentication.urls")),
    path('admin/', admin.site.urls),
]
