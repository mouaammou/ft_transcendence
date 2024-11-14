from rest_framework.viewsets import ModelViewSet
from game.models import LocalTournament
from .serializers.tournament import TournamentSerializer
from .pagination.tournament import TournamentPagination
from rest_framework.permissions import IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from game.local_game.eventloop import EventLoopManager


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
            # EventLoopManager.add(
            #     request.unique_key,
            #     tourn_obj=tournament
            # )
            # EventLoopManager.play(request.unique_key)
            if tournament.finished:
                return Response({"left": 'None', "right": 'None', 'title': tournament.title, 'finished': tournament.finished}, status=status.HTTP_200_OK)
            return Response({"left": players[0], "right": players[1], 'title': tournament.title, 'finished': tournament.finished}, status=status.HTTP_200_OK)

        except LocalTournament.DoesNotExist:
            return Response({"error": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)
    def post(self, request, id):
        try:
            EventLoopManager.add(
                request.unique_key,
                tourn_obj=LocalTournament.objects.get(id=id)
            )
            EventLoopManager.play(request.unique_key)
            return Response({"success": "Match Started."}, status=status.HTTP_200_OK)
        except LocalTournament.DoesNotExist:
            pass
        return Response({"fail": "Tournament Does Not Exist."}, status=status.HTTP_200_OK)

