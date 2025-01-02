from rest_framework.response import Response
from rest_framework import status, permissions
from authentication.serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.utils import set_jwt_cookies
from rest_framework.views import APIView
import logging

from authentication.totp.utils import validate_totp

logger = logging.getLogger(__name__)

class SignUp(APIView):

	permission_classes = [permissions.AllowAny]# by default ??

	def post(self, request, format=None):
		serializer = UserSerializer(data=request.data)
		if serializer.is_valid():
			try:
				user = serializer.save()
				refresh = RefreshToken.for_user(user)
				response = set_jwt_cookies(Response(), refresh)
				response.data = UserSerializer(user).data
				response.status_code = status.HTTP_201_CREATED
				logger.info(f"User {user.username} signed up")
				return response
			except Exception as error:
				logger.error(f"Error while signing up: {error}")
				return Response({"Error": str(error)}, status=status.HTTP_400_BAD_REQUEST)
		logger.error(f"Error while signing up: {serializer.errors}")
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Login(APIView):
	
	def post(self, request, format=None):
		username = request.data.get("username")
		password = request.data.get("password")

		if username == "" or password == "":
			return Response(
				{"Error": "Please provide both username and password"},
				status=status.HTTP_400_BAD_REQUEST,
			)

		user = authenticate(username=username, password=password)
		if user is not None and user.totp_enabled:
			code = request.data.get("totp_code")
			if not code:
				return Response({
							"msg": "send 2fa code with username and password, Or other authentication data",
							"totp":"2fa is enabled by the user" # this key allows the frontend to know that 2fa is enabled
						},
						status=status.HTTP_200_OK
					)
				# 	if not validate_totp(user.totp_secret, code):
                # return Response({"msg": "invalid code!"}, status=status.HTTP_400_BAD_REQUEST)
			elif code and not validate_totp(user.totp_secret, code):
				return Response({
							"msg": "invalid 2fa code!",
							"totp":"2fa is enabled by the user" # this key allows the frontend to know that 2fa is enabled
						},
						status=status.HTTP_200_OK
					)


		if user is not None:
			refresh = RefreshToken.for_user(user)
			response = set_jwt_cookies(Response(), refresh)
			response.status_code = status.HTTP_200_OK
			response.data = UserSerializer(user).data
			return response
		return Response({"Error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class Logout(APIView):
    def post(self, request):
        try:
            # Create the response object
            response = Response()

            # Get the refresh token
            refresh_token = request.COOKIES.get("refresh_token")

            # Only blacklist if refresh token exists
            if refresh_token:
                try:
                    # Blacklist the refresh token
                    blacklist = RefreshToken(refresh_token)
                    blacklist.blacklist()
                except Exception as e:
                    # Log the error but continue with logout
                    logger.error(f"Error blacklisting token: {str(e)}")

            # Always delete cookies, even if blacklisting fails
            response.delete_cookie("refresh_token", domain=None, path='/')
            response.delete_cookie("access_token", domain=None, path='/')

            # Set successful response
            response.status_code = status.HTTP_205_RESET_CONTENT
            response.data = {"message": "Logout successful"}

            return response

        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            # Even if there's an error, try to delete cookies
            response = Response(
                {"error": "Logout failed", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            response.delete_cookie("refresh_token", domain=None, path='/')
            response.delete_cookie("access_token", domain=None, path='/')
            return response
	
class VerifyToken(APIView):
	def post(self, request, *args, **kwargs):
		print(f"\n -- USERNAME : {request.customUser} -- \n")
		return Response({"message": "Tokens are valid"}, status=status.HTTP_200_OK)


