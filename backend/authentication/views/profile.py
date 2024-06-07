from rest_framework.decorators import api_view
from authentication.models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from authentication.serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.utils import set_jwt_cookies
from authentication.utils import has_valid_token

@api_view(["POST", "GET"])
@has_valid_token
def UserProfile(request):
	print(f"\nUser: {request.customuser}\n")
	return Response({"user": request.customuser}, status=status.HTTP_200_OK)
