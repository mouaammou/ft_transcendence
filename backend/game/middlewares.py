from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from http.cookies import SimpleCookie


class CookiesJWTAuthMiddleware:
    
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Extract cookies from headers
        headers = dict(scope.get('headers', {}))
        cookies = headers.get(b'cookie', b'').decode()
        cookies = SimpleCookie(cookies)
        scope['cookies'] = {name: cookie.value for name, cookie in cookies.items()}
        
        print(scope['cookies'])
        # Extract tokens from cookies
        refresh_token = scope.get("cookies", {}).get("refresh_token")
        # access_token = scope.get("cookies", {}).get("access_token")

        # Validate Refresh token
        try:
            refresh_token_obj = RefreshToken(refresh_token)
            # print('+'*15)
            # print(refresh_token.payload)
            # print('+'*15)
            user_id = refresh_token_obj.payload['user_id']
            scope['user'] = await self.get_user(user_id)
        except (TokenError, KeyError) as e:
            print("Middleware Error: ", e)
            scope['user'] = AnonymousUser()

        print("*** Middleware User: ", scope['user'], '***')
        # Call the inner application
        scope = dict(scope)
        return await self.inner(scope, receive, send)

    @database_sync_to_async
    def get_user(user_id):
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
