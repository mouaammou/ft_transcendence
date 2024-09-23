from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import LocalTournamentViewSet

router = DefaultRouter()
router.register(r'local-tournaments', LocalTournamentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
