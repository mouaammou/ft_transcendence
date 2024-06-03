from django.urls import re_path

from . import consumers


websocket_urlpatterns = [
    re_path(r'ws/pong/game/$', consumers.PongRoomConsumer.as_asgi()),
    re_path(r'ws/pong/new_game/$', consumers.PongRoomConsumer.as_asgi()),
]