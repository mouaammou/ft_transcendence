from django.core.exceptions import ValidationError
from .models import CustomUser, Friendship, Notification
from rest_framework import serializers
from django.conf import settings
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta
from  game.models import GameHistory
from django.db.models import Q 
import uuid

User = get_user_model()

#============= Friendship Serializer +++++++++++++++

from rest_framework import serializers
from django.db.models import Q
from .models import Friendship

class UserWithStatusSerializer(serializers.Serializer):
    id = serializers.IntegerField(source='friend.id')
    first_name = serializers.CharField(source='friend.first_name')
    last_name = serializers.CharField(source='friend.last_name')
    username = serializers.CharField(source='friend.username')
    email = serializers.EmailField(source='friend.email')
    avatar = serializers.ImageField(source='friend.avatar')
    status = serializers.CharField(source='friend.status')
    friendship_status = serializers.SerializerMethodField()
    received_status = serializers.SerializerMethodField()

    class Meta:
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 
                  'avatar', 'status', 'friendship_status', 'received_status']

    def get_friendship_status(self, obj):
        friendships = Friendship.objects.filter(
            Q(sender=obj['friend'], receiver=self.context['request'].customUser) |
            Q(sender=self.context['request'].customUser, receiver=obj['friend'])
        )
        if friendships.exists():
            return friendships.first().status
        return None

    def get_received_status(self, obj):
        friendships = Friendship.objects.filter(
            Q(sender=obj['friend'], receiver=self.context['request'].customUser) |
            Q(sender=self.context['request'].customUser, receiver=obj['friend'])
        )
        if friendships.exists():
            friendship = friendships.first()
            if friendship.sender == self.context['request'].customUser:
                return friendship.received_status
            return friendship.received_status if friendship.status == 'blocking' else friendship.status
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['avatar'] and not representation['avatar'].startswith('http'):
            representation['avatar'] = f"{settings.BACKEND_BASE_URL}{representation['avatar']}"
        return representation
	# end Friendship Serializer ================

#-------------- Notificaion Serializer ================#
class NotificationSerializer(serializers.ModelSerializer):
	username = serializers.CharField(source='sender.username', read_only=True)
	avatar = serializers.ImageField(source='sender.avatar', read_only=True)

	class Meta:
		model = Notification
		fields = (
			'id', 'sender', 'username', 'avatar',
			'message', 'created_at', 'is_read', 'notif_type', 'notif_status'
		)
		read_only_fields = ['created_at']
	
	def to_representation(self, instance):
		representation = super().to_representation(instance)
		if representation['avatar'] and not representation['avatar'].startswith('http'):
				representation['avatar'] = f"{settings.BACKEND_BASE_URL}{representation['avatar']}"
		return representation

#-------------- # Notificaion Serializer ================#

#============= friendship Serializer +++++++++++++++
class FriendsSerializer(serializers.ModelSerializer):
	sender = serializers.SerializerMethodField()
	receiver = serializers.SerializerMethodField()

	class Meta:
		model = Friendship
		fields = ('sender', 'receiver', 'status', 'created_at')
		read_only_fields = ['created_at']

	def validate(self, data):
		if data['sender'] == data['receiver']:
			raise serializers.ValidationError("Sender and receiver cannot be the same user.")
		if not data.get('receiver'):
			raise serializers.ValidationError("Receiver is not provided!")
		return data

	def get_user_data(self, user):
		user = UserSerializer(user).data
		return {
			'username': user.get('username'),
			'avatar': user.get('avatar')  # Assuming avatar is an ImageField
		}	

	def get_sender(self, obj):
		return self.get_user_data(obj.sender)

	def get_receiver(self, obj):
		return self.get_user_data(obj.receiver)
# end friendship Serializer ================

#============= CustomeUser Serializer +++++++++++++++
class UserSerializer(serializers.ModelSerializer):

	class Meta:
		model = CustomUser
		fields = ("id", "first_name", "last_name", "username", "email", "password", "avatar", "status")
		extra_kwargs = {"username": {"read_only": True}}
		extra_kwargs = {"password": {"write_only": True}}

	def create(self, validated_data):#maybe you can use the baseMOdelManger for this ??
		return CustomUser.objects.create_user(**validated_data)#use it for hash the password

	def to_representation(self, instance):
		representation = super().to_representation(instance)
		if representation['avatar']:
				representation['avatar'] = f"{settings.BACKEND_BASE_URL}{representation['avatar']}"
		return representation
# end CustomeUser Serializer ================

#============= CustomeUser Update Serializer +++++++++++++++
class UserUpdateSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['username', 'email', 'first_name', 'last_name', 'password', 'avatar']
		extra_kwargs = {
				'first_name': {'required': False},
				'last_name': {'required': False},
				'username': {'required': False},
				'email': {'required': False},
				'avatar': {'required': False},
				'password': {'write_only': True, 'required': False}
		}

	def to_representation(self, instance):
		representation = super().to_representation(instance)
		if representation['avatar']:
				representation['avatar'] = f"{settings.BACKEND_BASE_URL}{representation['avatar']}"
		return representation

	def update(self, instance, validated_data):

		avatar = validated_data.get('avatar')
		# If an avatar is provided and is empty, don't update it
		if 'avatar' in validated_data and (avatar is None or not avatar):
				validated_data.pop('avatar')

		# Update fields other than password 
		for attr, value in validated_data.items():
				if attr == 'password':
					instance.set_password(value)  # Hash the password
				else:
					setattr(instance, attr, value)  # Update other fields
		
		instance.save()  # Save the updated instance
		return instance
# end CustomeUser Update Serializer ================


########################## password forget ############################
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address")
        return value

    def save(self):
        # Generate unique token
        token = default_token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        
        # Save token to user
        self.user.reset_password_token = token
        self.user.reset_password_expire = datetime.now() + timedelta(hours=1)
        self.user.save()

        # Create reset link
        reset_url = f"{settings.FRONTEND_URL}/reset_password?token={token}&uid={uid}"

        # Send email
        send_mail(
            subject='Password Reset Request',
            message=f'Click the following link to reset your password: {reset_url}',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[self.user.email],
            fail_silently=False,
        )
########################## password forget ############################

########################## password reset ############################
class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    uidb64 = serializers.CharField()
    new_password = serializers.CharField(min_length=1, write_only=True)
    
    def validate(self, data):
        try:
            uid = urlsafe_base64_decode(data['uidb64']).decode()
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid reset link")

        if not default_token_generator.check_token(self.user, data['token']):
            raise serializers.ValidationError("Invalid or expired reset link")
        return data

    def save(self):
        # Set new password
        self.user.set_password(self.validated_data['new_password'])
        # Clear reset token
        self.user.reset_password_token = None
        self.user.reset_password_expire = None
        self.user.save()
########################## password reset ############################


class MinimiseUser(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'avatar']

class GameSerializer(serializers.ModelSerializer):
    player_1 = MinimiseUser()
    player_2 = MinimiseUser()

    class Meta:
        model = GameHistory
        fields = [
            'id',
            'player_1',
            'player_2',
            'creation_date',
            'creation_time',
            'player_1_score',
            'player_2_score',
            'winner_id',
            'loser_id',
            'game_type',
            'finish_type'
        ]