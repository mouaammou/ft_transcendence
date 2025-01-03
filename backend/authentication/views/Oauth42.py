import requests
import logging
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from authentication.utils import set_jwt_cookies
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken


from authentication.totp.views import get_2fa_cookie_token_for_user

import hmac
import hashlib
import base64


CustomUser = get_user_model()
logger = logging.getLogger(__name__)

import hmac
import hashlib
import base64
import time
from rest_framework.views import APIView
from rest_framework.response import Response


class OAuth42Login(APIView):
	def get(self, request):
		try:
			redirect_uri = settings.OAUTH42_REDIRECT_URI
			client_id = settings.OAUTH42_CLIENT_ID
			auth_url = f"{settings.OAUTH42_AUTH_URL}?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
			response = Response(data={"auth_url": auth_url} ,status=status.HTTP_200_OK)
		except Exception as e:
			logger.error(f"\nError on auth/login/42: {e}\n")
		return response



class OAuth42Callback(APIView):
    def get(self, request):
        response = Response()
        code = request.GET.get('code')
        
        if not code:
            logger.error("Error 42Oauth: Parameter Code not provided")
            return Response(
                {"error": "Authorization code not provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validate if code was already used
            if self._is_code_used(request, code):
                return Response(
                    {"error": "Authorization code already used"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get access token with retry mechanism
            token_data = self._prepare_token_data(code)
            access_token = self._get_access_token(token_data)
            
            if not access_token:
                return Response(
                    {"error": "Failed to obtain access token"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get and validate user data
            user_data = self._get_user_data(access_token)
            if not user_data:
                return Response(
                    {"error": "Failed to obtain user data"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process user data and handle login/registration
            return self._process_user(user_data, response)

        except Exception as e:
            logger.error(f"Error 42Oauth: {str(e)}", exc_info=True)
            return Response(
                {"error": "Authentication failed. Please try again."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def _is_code_used(self, request, code):
        """Check if the authorization code was already used"""
        if 'used_codes' not in request.session:
            request.session['used_codes'] = []
        
        if code in request.session['used_codes']:
            logger.warning(f"Warning 42Oauth: Code {code} was already used")
            return True
            
        request.session['used_codes'].append(code)
        request.session.modified = True
        return False

    def _prepare_token_data(self, code):
        """Prepare the token request data"""
        return {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH42_CLIENT_ID,
            'client_secret': settings.OAUTH42_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OAUTH42_REDIRECT_URI,
        }

    def _get_access_token(self, token_data):
        """Get access token with retry mechanism"""
        max_retries = 2
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                token_response = requests.post(
                    settings.OAUTH42_TOKEN_URL, 
                    data=token_data,
                    timeout=10
                )
                token_response_data = token_response.json()
                
                if 'access_token' in token_response_data:
                    return token_response_data['access_token']
                
                logger.error(
                    f"Error 42Oauth: Failed to obtain access token. "
                    f"Response: {token_response_data}"
                )
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Error 42Oauth token request: {str(e)}")
            
            retry_count += 1
            time.sleep(1)  # Wait before retry
            
        return None

    def _get_user_data(self, access_token):
        """Get user data from 42 API"""
        try:
            user_response = requests.get(
                settings.OAUTH42_USER_URL,
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            return user_response.json()
        except (requests.exceptions.RequestException, ValueError) as e:
            logger.error(f"Error fetching user data: {str(e)}")
            return None

    def _process_user(self, user_data, response):
        """Process user data and handle login/registration"""
        try:
            user_data_set = {
                "username": user_data['login'],
                "user42": user_data['login'],
                "first_name": user_data['first_name'],
                "last_name": user_data['last_name'],
                "email": user_data['email'],
            }
            avatar_url = user_data['image']['versions']['medium']

            try:
                user = CustomUser.objects.get(user42=user_data['login'])
                
                # Handle 2FA if enabled
                if user.totp_enabled:
                    cookie_data = get_2fa_cookie_token_for_user(user.id)
                    response = Response({"totp": "2fa verification is required!"})
                    response.set_cookie(**cookie_data)
                    return response
                
                # Normal login flow
                response = Response({"success": "Login successful"})
                return set_jwt_cookies(response, RefreshToken.for_user(user))

            except CustomUser.DoesNotExist:
                # Create new user
                user = CustomUser.objects.create(**user_data_set)
                random_password = CustomUser.objects.make_random_password()
                user.set_password(make_password(random_password))
                user.download_and_save_image(avatar_url)
                user.save()
                
                response = Response(
                    {"success": "User created successfully"}, 
                    status=status.HTTP_201_CREATED
                )
                return set_jwt_cookies(response, RefreshToken.for_user(user))

        except Exception as e:
            logger.error(f"Error processing user: {str(e)}", exc_info=True)
            raise