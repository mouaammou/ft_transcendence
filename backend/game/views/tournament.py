from rest_framework.viewsets import ModelViewSet
from game.models import LocalTournament
from .serializers.tournament import TournamentSerializer
from .pagination.tournament import TournamentPagination
from rest_framework.permissions import IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class LocalTournamentViewSet(ModelViewSet):
    queryset = LocalTournament.objects.all()
    serializer_class = TournamentSerializer
    pagination_class = TournamentPagination
    # lookup_field = 'id'
    # permission_classes = [IsAuthenticated, ]
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.customUser)



class TournamentNextMatchPlayersView(APIView):
    def get(self, request, id):
        try:
            tournament = LocalTournament.objects.get(id=id)
            players = tournament.get_match_players(tournament.match_index)
            return Response({"left": players[0], "right": players[1], 'title': tournament.title}, status=status.HTTP_200_OK)

        except LocalTournament.DoesNotExist:
            return Response({"detail": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)

