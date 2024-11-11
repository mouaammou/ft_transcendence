from rest_framework.viewsets import ModelViewSet
from game.models import LocalTournament
from .serializers.tournament import TournamentSerializer
from .pagination.tournament import TournamentPagination
from rest_framework.permissions import IsAuthenticated

class LocalTournamentViewSet(ModelViewSet):
    queryset = LocalTournament.objects.all()
    serializer_class = TournamentSerializer
    pagination_class = TournamentPagination
    # permission_classes = [IsAuthenticated, ]

    

    def perform_create(self, serializer):
        serializer.save(user=self.request.customUser)