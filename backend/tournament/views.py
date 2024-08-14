from django.shortcuts import render
from rest_framework.response import Response
from .models import Tournament
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
def update_tournament_name(request):
    print("pppppppp")
    if Tournament.objects.filter(name=request.data['name']).exists():
        # Tournament.objects.filter(name=request.data['name']).update(name=request.data['new_name'])
        tournament_obj = Tournament.objects.get(name=request.data['name'])
        tournament_obj.name = request.data['name']
        tournament_obj.save()
        return Response({"message": "Tournament updated."})
    else:
        Tournament.objects.create(name=request.data['name'])
        return Response({"message": "Tournament created."})