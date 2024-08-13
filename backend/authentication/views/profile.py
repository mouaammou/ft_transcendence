from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from authentication.serializers import UserSerializer, UserUpdateSerializer
from django.conf import settings
from rest_framework.views import APIView
from authentication.utils import has_valid_token
from django.contrib.auth import get_user_model

User = get_user_model()

@api_view(["POST"])
@has_valid_token
def UserProfile(request):
	user = UserSerializer(request.user).data
	return Response({"user": user}, status=status.HTTP_200_OK)

@api_view(["POST"])
@has_valid_token
def UpdateProfile(request):

	user = request.user

	print(f"\n--- {user} --\n")
	try:
		user_instance = User.objects.get(id=user.id)
	except User.DoesNotExist:
		return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

	serializer = UserUpdateSerializer(user_instance, data=request.data, partial=True)
	if serializer.is_valid():
		password = request.data.get('password')
		print(f"\n--- {password} --\n")
		if password:
			password = user_instance.set_password(password)
		serializer.save()
		return Response({"success":"updated sucessfully", "avatar": serializer.data['avatar']}, status=status.HTTP_200_OK)
	return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)  # Use 400 for validation errors


# class UpdateProfile(generics.GenericAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserUpdateSerializer

#     def post(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)

#         return Response(serializer.data)

#     def perform_update(self, serializer):
#         serializer.save()
# class UpdateProfile(generics.UpdateAPIView):
# 	queryset = User.objects.all()
# 	serializer_class = UserUPdateSerializer

# 	def update(self, request, *args, **kwargs):
# 		partial = kwargs.pop('partial', False)
# 		instance = self.get_object()
# 		serializer = self.get_serializer(instance, data=request.data, partial=partial)
# 		serializer.is_valid(raise_exception=True)
# 		self.perform_update(serializer)

# 		if getattr(instance, '_prefetched_objects_cache', None):
# 			instance._prefetched_objects_cache = {}

# 		return Response(serializer.data)

# 	def perform_update(self, serializer):
# 		serializer.save()