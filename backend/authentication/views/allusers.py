from django.contrib.auth import get_user_model
from authentication.serializers import UserSerializer
from rest_framework import generics
from rest_framework.response import Response

User = get_user_model()

class allUser(generics.GenericAPIView):
	query_set = User.objects.all()
	serializer_class = UserSerializer

	def get(self, request, *args, **kwargs):
		users = User.objects.all()
		serializer = UserSerializer(users, many=True)
		return Response(serializer.data, status=200)