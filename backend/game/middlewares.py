from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from http.cookies import SimpleCookie


import sys

class CookiesJWTAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers = dict(scope.get('headers', {}))

        cookies = headers.get(b'cookie', b'').decode()
        cookies = SimpleCookie(cookies)
        scope['cookies'] = {name: cookie.value for name, cookie in cookies.items()}
        refresh_token = scope.get("cookies", {}).get("refresh_token")
        try:
            refresh_token_obj = await self.get_token_obj(refresh_token)
            scope['channel_name'] = refresh_token_obj.payload['channel_name']
            user_id = refresh_token_obj.payload['user_id']
            scope['user'] = await self.get_user(user_id)
        except (TokenError, KeyError) as e:
            scope['user'] = AnonymousUser()
        scope = dict(scope)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
    
    @database_sync_to_async
    def get_token_obj(self, refresh_token):
        return RefreshToken(refresh_token)
