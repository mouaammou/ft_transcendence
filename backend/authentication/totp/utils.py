import re
import pyotp
import qrcode
import io
import base64
from PIL import Image


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