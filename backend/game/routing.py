from django.urls import re_path

from .consumers import GlobalConsumer
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/local/$', GlobalConsumer.as_asgi()),
    re_path(r'ws/global/$', consumers.GlobalConsumer.as_asgi()),
]