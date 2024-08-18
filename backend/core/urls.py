from django.contrib import admin
from django.urls import path, include
from tournament import views

urlpatterns = [
    path('game/', include('game.urls')),
    # path('play/', include('tournament.urls')),
    path('', include("authentication.urls")),
    path('admin/', admin.site.urls),
    path("play/update_tournament_name/", views.update_tournament_name, name="update_tournament_name"),
]
