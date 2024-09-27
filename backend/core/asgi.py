"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import URLRouter
from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

from authentication.routing import websocket_urlpatterns
from game.middlewares import CookiesJWTAuthMiddleware
from authentication.middleware import UserOnlineStatusMiddleware
from game.routing import websocket_urlpatterns as game_urls

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': UserOnlineStatusMiddleware(
            URLRouter(websocket_urlpatterns + game_urls),
        ),
})
