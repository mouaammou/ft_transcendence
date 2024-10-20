from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from authentication.serializers import UserSerializer
from django.db.models import Q

User = get_user_model()

class SearchClass(APIView):
	# will search for a string in (username, first_name, last_name, email), and return the users that match
	# any (username, first_name, last_name, email) that contains the search string
	# searched string is 'searchedIterm'
	def get(self, request, searchedQuery):
		users = User.objects.filter(
			Q(username__icontains=searchedQuery) |
			Q(first_name__icontains=searchedQuery) |
			Q(last_name__icontains=searchedQuery)
		)[:6]  # Limit the search to return only 6 users
		serializer = UserSerializer(users, many=True)
		return Response(serializer.data)