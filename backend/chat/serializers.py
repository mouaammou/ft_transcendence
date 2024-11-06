from rest_framework import serializers
from .models import Message

from authentication.serializers import UserSerializer

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



# Serializer for wrapping friend data and their last message
class FriendWithLastMessageSerializer(serializers.Serializer):
    friend = UserSerializer()  # Use the existing UserSerializer
    last_message = LastMessageSerializer()  # Use LastMessageSerializer for the last message

    class Meta:
        fields = ['friend', 'last_message']