from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views.tournament import LocalTournamentViewSet, TournamentNextMatchPlayersView
from .views.play import PlayTounament, PlayRegular

urlpatterns = [
    path(
        'local-tournaments/filter/<str:filter_keyword>/',
        LocalTournamentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='local-tournaments',
    ),
    path(
        'local-tournaments/',
        LocalTournamentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='local-tournaments',
    ),
    path(
        'local-tournaments/<int:pk>/',
        LocalTournamentViewSet.as_view({'get': 'retrieve'}),
        name='local-tournaments-details',
    ),
    path('play-tournament/', PlayTounament.as_view(), name='play-tournament'),
    path('play-regular', PlayRegular.as_view(), name='play-regular'),
    path('local-tournaments/next-match-players/<int:id>/', TournamentNextMatchPlayersView.as_view(), name='tournament-next-match-players'),
]

