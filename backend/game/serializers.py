# from rest_framework import serializers
# from .models import LocalTournament

# class LocalTournamentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = LocalTournament
#         fields = '__all__'  # or specify the fields you need

from rest_framework import serializers
from .models import LocalTournament

class BulkLocalTournamentSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        tournaments = [LocalTournament(**item) for item in validated_data]
        return LocalTournament.objects.bulk_create(tournaments)

    def update(self, instance, validated_data):
        # Map instance objects to dictionary
        tournament_mapping = {tournament.id: tournament for tournament in instance}
        data_mapping = {item['id']: item for item in validated_data}

        ret = []
        for tournament_id, data in data_mapping.items():
            tournament = tournament_mapping.get(tournament_id, None)
            if tournament:
                for attr, value in data.items():
                    setattr(tournament, attr, value)
                tournament.save()
                ret.append(tournament)

        return ret

    def delete(self, instance):
        instance.delete()

class LocalTournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalTournament
        fields = '__all__'
        list_serializer_class = BulkLocalTournamentSerializer


