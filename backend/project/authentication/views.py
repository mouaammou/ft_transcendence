from rest_framework.decorators import api_view
from .models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from django.http import HttpResponse


@api_view(["POST", "GET"])
def SignUp(request):
	form_data = request.data

	if request.method == "GET":
		users = CustomUser.objects.all()
		seriaze_user = UserSerializer(users, many=True)
		return Response(seriaze_user.data, status=status.HTTP_200_OK)

	if request.method == "POST":
		seriaze_user = UserSerializer(data=form_data)
		if seriaze_user.is_valid():
			seriaze_user.save()
			return Response(seriaze_user.data,  status=status.HTTP_201_CREATED)
	return Response(seriaze_user.errors, status=status.HTTP_400_BAD_REQUEST)


def default(request):
    h1 = "<h1>Welcome to the default page</h1>"
    return HttpResponse(h1)
