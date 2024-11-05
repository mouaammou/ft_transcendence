from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField()
    receiver = serializers.StringRelatedField()
    # Add a human-readable timestamp format
    # timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = Message
        fields = ['sender', 'receiver', 'message', 'timestamp']


# New LastMessageSerializer for displaying the last message and timestamp
class LastMessageSerializer(serializers.ModelSerializer):
    message = serializers.CharField()
    timestamp = serializers.DateTimeField()

    class Meta:
        model = Message
        fields = ['message', 'timestamp']
