from django.urls import path
from .consumers import ConnectFourConsumer

websocket_urlpatterns = [
    path("ws/four_game/", ConnectFourConsumer().as_asgi()),
]