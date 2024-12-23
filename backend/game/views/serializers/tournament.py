from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import ValidationError
from game.models import LocalTournament
import re


class TournamentSerializer(ModelSerializer):
    class Meta:
        model = LocalTournament
        read_only_fields = ('user', )
        exclude = ('user', 'start_at')
    
    def validate(self, data):
        fields = dict(data)
        fields.pop('title')
        self.validate_duplication(list(fields.values()))
        self.validate_length(list(data.values()))
        self.validate_allowed_chars(list(data.values()))
        return data

    def validate_duplication(self, data_values):
        for nickname in data_values:
            if data_values.count(nickname) > 1:
                raise ValidationError('Duplicate nicknames found!: ' + str(nickname))

    def validate_length(self, data_values):
        for value in data_values:
            if len(value.strip()) < 3 or len(value.strip()) > 18:
                raise ValidationError(
                    "All fields must be between 3 and 18 characters long: " + str(value)
                )
    
    def validate_allowed_chars(self, data_values):
        valid_pattern = re.compile(r'^[a-zA-Z0-9_ ]*$')
        for nickname in data_values:
            if not valid_pattern.match(nickname):
                raise ValidationError('All fields can only container alphanumeric characters and underscores: ' + str(nickname))