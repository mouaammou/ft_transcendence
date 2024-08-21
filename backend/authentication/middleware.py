from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken, TokenError

User = get_user_model()


class TokenVerificationMiddleWare:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        unrestricted_paths = [
            "/auth/login/42", "/auth/callback/42",
            "/signup", "/login", "/logout",
            "/token", "/token/refresh",
        ]

        if request.path.startswith("/admin") or request.path in unrestricted_paths:
            return self.get_response(request)  # Proceed with the request

        refresh_token = request.COOKIES.get("refresh_token")
        access_token = request.COOKIES.get("access_token")

        if not refresh_token:
            return JsonResponse(
                {"error": "refresh token not found or invalid"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh_token_obj = RefreshToken(refresh_token)
            # print('x'*15)
            # print(refresh_token_obj.payload)
            # print('x'*15)
            if not access_token:
                # Generate a new access token if none exists or is invalid
                new_access_token = refresh_token_obj.access_token
                print('x'*15)
                print(new_access_token.payload)
                print('x'*15)
                response = self.get_response(request)
                response.set_cookie(
                    key="access_token",
                    value=(str(new_access_token)),
                    httponly=True,
                    samesite="Lax",#??
                    max_age= 60*60*24,  # 7 days
                )
                return response

            # Validate the access token
            try:
                user_id = AccessToken(access_token).get("user_id")
                request.customUser = User.objects.get(id=user_id)
                return self.get_response(request)
            except (TokenError, User.DoesNotExist):
                # If access token is invalid, create a new one
                new_access_token = refresh_token_obj.access_token
                print('x'*15)
                print(new_access_token.payload)
                print('x'*15)
                response = self.get_response(request)
                response.set_cookie(
                    key="access_token",
                    value=(str(new_access_token)),
                    httponly=True,
                    samesite="Lax",#??
                    max_age= 60*60*24,  # 7 days
                )
                print("___)))))))))))))))")
                return response
        except TokenError:
            return JsonResponse({"error": "refresh token invalid"}, status=status.HTTP_401_UNAUTHORIZED)
