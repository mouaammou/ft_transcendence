from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from authentication.utils import set_jwt_cookies
from rest_framework_simplejwt.tokens import RefreshToken


import re
import pyotp
import qrcode
import io
import base64
from PIL import Image
import secrets



import hmac
import hashlib
import base64
import time


User = get_user_model()


def generate_totp_secret():
    totp = pyotp.TOTP(pyotp.random_base32())
    return totp.secret

def otpauth_uri_format(secret, email):
    topt = pyotp.TOTP(secret)
    return topt.provisioning_uri(email, issuer_name="FT_TRANSCENDENCE-2FA")

def validate_totp(secret: str, code: str):
    totp = pyotp.TOTP(secret)
    return totp.verify(code)

def get_qrcode_img(otpauth_uri):
    img = qrcode.make(otpauth_uri)
    # img = img.resize(size, Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return {"img":img_base64, "mime_type":"image/png", "encoding":"base64"}


# enable: POST
# validate: POST
# disable: DELETE
# get_qrcode: GET 

class TwoFactorAuthView(APIView):
    permissions = [IsAuthenticated]

    def get(self, request, action=None):
        "return qr code img"
        user = request.customUser
        if action == "qrcode":
            if not user.totp_enabled:
                secret = generate_totp_secret()
                user.totp_secret = secret
                user.save()
            otpauth_uri = otpauth_uri_format(user.totp_secret, user.email)
            data = get_qrcode_img(otpauth_uri)
            data["secret"] = user.totp_secret
            data["enabled"] = user.totp_enabled
            return Response(data, status=status.HTTP_200_OK)
        
        if action == "is-enabled":
            if user.totp_enabled:
                return Response({"msg": "2FA is enabled!"}, status=status.HTTP_200_OK)
            return Response({"msg": "2fa not enabled!"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"msg": "action not found!"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, action=None):
        user = request.customUser
        data = {}
        if action == "enable":
            if user.totp_enabled:
                data["msg"] = "2FA is already enabled!"
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            
            code = request.data.get("code")
            if not code:
                data["msg"] = "code is required to enable!"
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            
            if not validate_totp(user.totp_secret, code):
                data["msg"] = "can't enable, invalid code!"
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
            
            user.totp_enabled = True
            user.save()
            data["msg"] = "valid code, 2FA is enabled!"
            return Response(data, status=status.HTTP_200_OK)
        
        elif action == "validate":
            if not user.totp_enabled:
                return self.topt_not_enabed_response()
            code = request.data.get("code")
            if not code:
                return Response({"msg": "code is required!"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not validate_totp(user.totp_secret, code):
                return Response({"msg": "invalid code!"}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({"msg": "valid code!"}, status=status.HTTP_200_OK)
        
        return Response({"msg": "action not found!"}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, action=''):
        if action != "disable":
            return Response({"msg": "action not found!"}, status=status.HTTP_404_NOT_FOUND)
        user = request.customUser
        if not user.totp_enabled:
            return self.topt_not_enabed_response()
        
        user.totp_secret = None
        user.totp_enabled = False
        user.save()
        data = {}
        data["msg"] = "2FA disabled!"

        return Response(data, status=status.HTTP_200_OK)
    
    def topt_not_enabed_response(self):
        data = {}
        data["msg"] = "2FA is not enabled!"
        return Response(data, status=status.HTTP_400_BAD_REQUEST)



class User2faVerificationView(APIView):
    SECRET_KEY = secrets.token_bytes(32)
    # SECRET_KEY = b"2fa_secret_key"
    TOKEN_LIFETIME = 120.0 # 2 minutes
    TOKEN_NAME = "2fa_token" # cookie name
    DELAY_RESPONSE_TIME = 1.0 # seconds to avoid bruteforce attacks

    def post(self, request):
        print("iammmmmmmmmmmmherrrerrr")
        token = request.COOKIES.get(__class__.TOKEN_NAME)
        is_valid, message_or_userid = self.verify_userid(token)
        user_id = __class__.decode_userid(token)
        if not is_valid or user_id is None:
            # invlaid token so remove the cookie
            # and front end will redirect to login page
            response = Response(status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie(__class__.TOKEN_NAME) 
            response.data = {"msg": message_or_userid}
            return response

        user = User.objects.get(id=user_id)
        if user is None or user.is_anonymous:
            return Response({"msg": "User not found!"}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.totp_enabled:
            return Response({"msg": "You dont have the permissions to call this endpoint!"}, status=status.HTTP_401_UNAUTHORIZED)

        totp_code = request.data.get("totp_code")
        if not totp_code:
            return Response({"msg": "totp_code is required!"}, status=status.HTTP_400_BAD_REQUEST)

        time.sleep(__class__.DELAY_RESPONSE_TIME)

        if not validate_totp(user.totp_secret, totp_code):
            return Response({"msg": "invalid totp code!"}, status=status.HTTP_400_BAD_REQUEST)

        # set jwt cookies
        response = Response()
        response.delete_cookie(__class__.TOKEN_NAME)
        response = set_jwt_cookies(response, RefreshToken.for_user(user))
        response.status_code = status.HTTP_200_OK
        response.data = {"success":"2fa verified"}
        return response

    @staticmethod
    def encode_userid(userid, expiration_time=None):
        """Encode the userid with a secure HMAC signature and expiration."""
        if expiration_time is None:
            expiration_time = int(time.time()) + __class__.TOKEN_LIFETIME
        data = f"{userid}:{expiration_time}"
        signature = hmac.new(__class__.SECRET_KEY, data.encode(), hashlib.sha256).digest()

        token = f"{data}:{base64.urlsafe_b64encode(signature).decode()}"
        return base64.urlsafe_b64encode(token.encode()).decode(), signature

    @staticmethod
    def verify_userid(token):
        """Verify the token and check the expiration."""
        try:
            decoded_token = base64.urlsafe_b64decode(token).decode()
            userid, expiration_time, provided_signature = decoded_token.rsplit(":", 2)

            if float(expiration_time) < time.time():
                return False, "Token expired"
            
            provided_signature = base64.urlsafe_b64decode(provided_signature)
            _, expected_signature = __class__.encode_userid(userid, expiration_time)

            if hmac.compare_digest(expected_signature, provided_signature):
                return True, userid
            else:
                return False, "Invalid signature"
        except Exception as e:
            return False, "Invalid 2fa token format"
    
    @staticmethod
    def decode_userid(token):
        """Decode the token and return the userid."""
        try:
            decoded_token = base64.urlsafe_b64decode(token).decode()
            userid, _, _ = decoded_token.rsplit(":", 2)
            int(userid)
            return userid
        except Exception as e:
            return None
    

def get_2fa_cookie_token_for_user(user_id) -> dict:
    # valid for __class__.TOKEN_LIFETIME seconds
    # add max age to cookie
    return {
        "key": User2faVerificationView.TOKEN_NAME,
        "value": User2faVerificationView.encode_userid(user_id)[0], # return (token, signature)
        "max_age": User2faVerificationView.TOKEN_LIFETIME,
        "httponly": True,
        "samesite": "Lax",
    }