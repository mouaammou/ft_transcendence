from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from authentication.models import CustomUser
from game.models import GameHistory
from django.db.models import Q 


def calculate_level_and_progress(user):
    # Assuming GameHistory has a field 'winner' to indicate the winner of the match
    print('In calculate_level_and_progress')
    games_played = GameHistory.objects.filter(Q(player_1=user) | Q(player_2=user))
    
    total_xp = 0
    for game in games_played:
        if game.winner_id == user.id:
            total_xp += 40  # Winning match
        else:
            total_xp += 10   # Losing match
    
    level = total_xp // 100  # Each level requires 100 XP
    current_xp = total_xp % 100
    progress = current_xp % 100  # Progress in percentage
    print('Print the level, progress and current_xp')
    print(level, progress, current_xp)
    return level + 1, progress, current_xp

def get_progress(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    level, progress, current_xp = calculate_level_and_progress(user)
    
    data = {
        'level': level,
        'progress': progress,
        'current_xp': current_xp,
    }
    
    return JsonResponse(data)


