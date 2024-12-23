from rest_framework import serializers
from .models import Message
from authentication.models import CustomUser

from authentication.serializers import UserSerializer
from django.conf import settings

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
    is_read = serializers.BooleanField()
    unread_count = serializers.IntegerField()
    
    class Meta:
        model = Message
        fields = ['message', 'timestamp', 'is_read', 'unread_count']


class UserSerializerChat(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'avatar', 'status']
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['avatar'] and not representation['avatar'].startswith('http'):
                representation['avatar'] = f"{settings.BACKEND_BASE_URL}{representation['avatar']}"
        return representation

class FriendWithLastMessageSerializer(serializers.Serializer):
    friend = serializers.SerializerMethodField()
    last_message = LastMessageSerializer()

    class Meta:
        fields = ['friend', 'last_message']

    def get_friend(self, obj):
        user_id = obj['friend']['user']
        user = CustomUser.objects.get(id=user_id)
        user_data = UserSerializerChat(user).data
        user_data['friendship_status'] = obj['friend']['friendship_status']
        return user_data