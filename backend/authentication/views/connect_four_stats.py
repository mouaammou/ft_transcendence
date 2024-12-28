from django.http import JsonResponse
from game.models import GameHistory
from django.shortcuts import get_object_or_404
from authentication.models import CustomUser
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ConnectFourStatsView(APIView):

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)

        connect_four_games = GameHistory.objects.filter(Q(player_1=user) | Q(player_2=user), game_type='connect_four')

        stats = {
            'Wins': 0,
            'Losses': 0,
            'Draws': 0,
            'Disconnections': 0
        }

        for game in connect_four_games:
            if game.finish_type == 'defeat':
                if game.winner_id == user_id:
                    stats['Wins'] += 1
                elif game.loser_id == user_id:
                    stats['Losses'] += 1
            elif game.finish_type == 'disconnect':
                stats['Disconnections'] += 1
            else:
                stats['Draws'] += 1

        data = [
            {'name': 'Wins', 'value': stats['Wins']},
            {'name': 'Losses', 'value': stats['Losses']},
            {'name': 'Draws', 'value': stats['Draws']},
            {'name': 'Disconnections', 'value': stats['Disconnections']},
        ]

        return Response(data, status=status.HTTP_200_OK)