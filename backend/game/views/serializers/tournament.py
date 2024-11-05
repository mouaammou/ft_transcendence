from rest_framework.serializers import ModelSerializer
from game.models import LocalTournament


class TournamentSerializer(ModelSerializer):
    class Meta:
        model = LocalTournament
        read_only_fields = ('user', )
        exclude = ('user', 'start_at')