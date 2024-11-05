from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views.tournament import LocalTournamentViewSet
from .views.play import PlayTounament, PlayRegular

urlpatterns = [
    path(
        'local-tournaments/',
        LocalTournamentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='local-tournaments',
    ),
    path('play-tournament/', PlayTounament.as_view(), name='play-tournament'),
    path('play-regular/', PlayRegular.as_view(), name='play-regular'),
]

