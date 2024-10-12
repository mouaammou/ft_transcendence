# from django.urls import path

# from . import consumers

# websocket_urlpatterns = [
#     path('ws/chat/<int:receiver_id>', consumers.ChatConsumer.as_asgi()),
# ]



from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat$', consumers.ChatConsumer.as_asgi()),
]
