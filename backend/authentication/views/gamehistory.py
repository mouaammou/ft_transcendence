from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
from game.models import GameHistory
from authentication.serializers import GameSerializer
from django.shortcuts import get_object_or_404
from authentication.models import CustomUser
from django.db.models import Q 

class UserGamesListView(generics.ListAPIView):
    serializer_class = GameSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = get_object_or_404(CustomUser, id=user_id)
        return GameHistory.objects.filter(Q(player_1=user) | Q(player_2=user)).order_by('-creation_date', '-creation_time')