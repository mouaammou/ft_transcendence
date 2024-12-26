from django.shortcuts import get_object_or_404
from authentication.models import CustomUser
from game.models import GameHistory
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

def calculate_level_and_progress(user):
    games_played = GameHistory.objects.filter(Q(player_1=user) | Q(player_2=user))
    
    total_xp = 0
    for game in games_played:
        if game.winner_id == user.id:
            total_xp += 40  
        else:
            total_xp += 10   
    level = total_xp // 100  
    current_xp = total_xp % 100
    progress = current_xp
    return level + 1, progress, current_xp

class ProgressLevelView(APIView):

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        level, progress, current_xp = calculate_level_and_progress(user)
        
        data = {
            'level': level,
            'progress': progress,
            'current_xp': current_xp,
        }
        
        return Response(data, status=status.HTTP_200_OK)