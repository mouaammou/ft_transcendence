from rest_framework.decorators import api_view
from authentication.models import CustomUser
from rest_framework.response import Response
from rest_framework import status, permissions
from authentication.serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.utils import set_jwt_cookies
from authentication.utils import has_valid_token
from rest_framework.views import APIView


class SignUp(APIView):

	permission_classes = [permissions.AllowAny]# by default ??

	def post(self, request, format=None):
		serializer = UserSerializer(data=request.data)
		if serializer.is_valid():
			try:
				user = serializer.save()
				refresh = RefreshToken.for_user(user)
				response = set_jwt_cookies(Response(), refresh)
				response.data = {"message":"singup success"}
				response.status_code = status.HTTP_201_CREATED
				return response
			except Exception as error:
				return Response({"Error":"Error on Signup class"}, status=status.					HTTP_500_INTERNAL_SERVER_ERROR)


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

		if user is not None:
			refresh = RefreshToken.for_user(user)
			response = set_jwt_cookies(Response(), refresh)
			response.status_code = status.HTTP_200_OK
			return response
		return Response({"Error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


class Logout(APIView):
	def post(self, request):
		response = Response()
		#blacklist the refresh token
		refresh_token = request.COOKIES.get("refresh_token")
		blacklist = RefreshToken(refresh_token)
		response.delete_cookie("refresh_token")
		response.delete_cookie("access_token")
		blacklist.blacklist()
		response.status_code = status.HTTP_205_RESET_CONTENT
		response.data = {"message": "Logout successfully"}
		return response


@api_view(["POST"])
# @has_valid_token
def Verify_Token(request):
	return Response(
		{"message": "Tokens Still valid"},
		status=status.HTTP_200_OK,
	)

