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

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()

from game.routing import websocket_urlpatterns
from game.middlewares import CookiesJWTAuthMiddleware

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        CookiesJWTAuthMiddleware(
            URLRouter(websocket_urlpatterns),
        ),
    ),
})
