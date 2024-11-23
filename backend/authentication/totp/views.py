from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser

import re
import pyotp
import qrcode
import io
import base64
from PIL import Image


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
        data = {}
        try:
            data = JSONParser().parse(request)
        except Exception:
            return Response({"msg": "Invalid JSON data!"}, status=400)
        
        code = data.get("code")
        if not code:
            return Response({"msg": "to disable 2fa, code confirmation is required!"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not re.fullmatch(r"^\d{6}$", str(code)):
            return Response({"msg": "Code must be a 6-digit number!"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not validate_totp(user.totp_secret, code):
            return Response({"msg": "invalid confirmation code!"}, status=status.HTTP_400_BAD_REQUEST)
        
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
    
