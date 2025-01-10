from django.urls import re_path

from .consumers import LocalConsumer
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/local/$', LocalConsumer.as_asgi()),
    re_path(r'ws/global/$', consumers.GlobalConsumer.as_asgi()),
]
