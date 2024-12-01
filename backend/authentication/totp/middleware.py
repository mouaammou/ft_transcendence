import jwt
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from django.shortcuts import redirect
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime

class TwoFactorAuthenticationMiddleware:
    """Middleware to check if the user has completed 2FA verification.
        You should put it after the AuthenticationMiddleware in the MIDDLEWARE list.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == '/2fa/validate/':
            return self.get_response(request)

        totp_validated = request.jwt_payload.get('2fa_validated')
        if totp_validated is None:
            return self.get_response(request)
        if totp_validated is False:
            return JsonResponse(
                {"error": "2FA verification required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        

        # If no issues, proceed to the next middleware or view
        response = self.get_response(request)
        return response
