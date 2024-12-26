from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from authentication.models import CustomUser
from game.models import GameHistory
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q

class GameHistoryStatsView(APIView):

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        today = timezone.now().date()
        seven_days_ago = today - timedelta(days=6)

        game_history = GameHistory.objects.filter(
            Q(player_1=user) | Q(player_2=user),
            creation_date__range=[seven_days_ago, today]
        ).exclude(game_type='connect_four')

        stats = {}
        for i in range(7):
            date = seven_days_ago + timedelta(days=i)
            games_on_date = game_history.filter(creation_date=date)
            total_games = games_on_date.count()
            if total_games > 0:
                wins = games_on_date.filter(winner_id=user.id).count()
                losses = games_on_date.filter(loser_id=user.id).count()
                stats[date.strftime('%m/%d')] = {
                    'wins': (wins / total_games) * 100,
                    'losses': (losses / total_games) * 100
                }
            else:
                stats[date.strftime('%m/%d')] = {
                    'wins': 0,
                    'losses': 0
                }

        data = [{'date': date, 'wins': stat['wins'], 'losses': stat['losses']} for date, stat in stats.items()]

        return Response(data, status=status.HTTP_200_OK)