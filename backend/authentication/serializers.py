from .models import Friendship
from django.db.models import Q
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
from game.models import GameHistory
from django.db.models import Q
import uuid
from django.utils import timezone


User = get_user_model()

# ============= Friendship Serializer +++++++++++++++


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
			Q(sender=self.context['request'].customUser,
			  receiver=obj['friend'])
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
			representation['avatar'] = f"https://{settings.DOMAIN_NAME}{representation['avatar']}"


		return representation
	# end Friendship Serializer ================

# -------------- Notificaion Serializer ================#


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
			representation['avatar'] = f"https://{settings.DOMAIN_NAME}{representation['avatar']}"
		return representation

# -------------- # Notificaion Serializer ================#

# ============= friendship Serializer +++++++++++++++


class FriendsSerializer(serializers.ModelSerializer):
	sender = serializers.SerializerMethodField()
	receiver = serializers.SerializerMethodField()

	class Meta:
		model = Friendship
		fields = ('sender', 'receiver', 'status', 'created_at')
		read_only_fields = ['created_at']

	def validate(self, data):
		if data['sender'] == data['receiver']:
			raise serializers.ValidationError(
				"Sender and receiver cannot be the same user.")
		if not data.get('receiver'):
			raise serializers.ValidationError("Receiver is not provided!")
		return data

	def get_user_data(self, user):
		user = UserSerializer(user).data
		return {
			'username': user.get('username'),
			# Assuming avatar is an ImageField
			'avatar': user.get('avatar')
		}

	def get_sender(self, obj):
		return self.get_user_data(obj.sender)

	def get_receiver(self, obj):
		return self.get_user_data(obj.receiver)
# end friendship Serializer ================

# ============= CustomeUser Serializer +++++++++++++++


from rest_framework import serializers
from django.core.validators import RegexValidator
import re

class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        min_length=5,
        max_length=8,
        error_messages={
            'blank': 'First name cannot be blank',
            'min_length': 'First name must be at least 6 characters',
            'max_length': 'First name cannot be longer than 10 characters'
        }
    )
    
    last_name = serializers.CharField(
        min_length=5,
        max_length=8,
        error_messages={
            'blank': 'Last name cannot be blank',
            'min_length': 'Last name must be at least 6 characters',
            'max_length': 'Last name cannot be longer than 10 characters'
        }
    )
    
    username = serializers.CharField(
        min_length=5,
        max_length=8,
        error_messages={
            'blank': 'Username cannot be blank',
            'min_length': 'Username must be at least 6 characters',
            'max_length': 'Username cannot be longer than 10 characters',
            'unique': 'This username is already taken'
        }
    )
    
    email = serializers.EmailField(
        error_messages={
            'blank': 'Email cannot be blank',
            'unique': 'This email is already registered'
        }
    )
    
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'blank': 'Password cannot be blank',
            'min_length': 'Password must be at least 6 characters'
        }
    )

    class Meta:
        model = CustomUser
        fields = ("id", "first_name", "last_name", "username",
                 "email", "password", "avatar", "status", "level",
                 "phone", "totp_enabled")
        extra_kwargs = {
            "username": {"read_only": True},
            "password": {"write_only": True},
            "level": {"read_only": True},
            "totp_enabled": {"read_only": True},
            "status": {"read_only": True}
        }

    def validate_username(self, value):
        if self.Meta.model.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken")
        return value

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation.get('avatar'):
            representation['avatar'] = f"https://{settings.DOMAIN_NAME}{representation['avatar']}"
        return representation
# end CustomeUser Serializer ================

# ============= CustomeUser Update Serializer +++++++++++++++


class UserUpdateSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['id', 'username', 'email', 'first_name',
					'last_name', 'password', 'avatar']
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
			representation['avatar'] = f"https://{settings.DOMAIN_NAME}{representation['avatar']}"
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

	THROTTLE_DURATION = timedelta(minutes=5)  # Cooldown period of 5 minutes

	def validate_email(self, value):
		try:
			self.user = User.objects.get(email=value)
			
			# Check if user has recently requested a reset
			if self.user.last_reset_email_sent:
				time_since_last_email = timezone.now() - self.user.last_reset_email_sent
				time_remaining = self.THROTTLE_DURATION - time_since_last_email
				
				if time_remaining > timedelta():
					minutes_remaining = int(time_remaining.total_seconds() / 60)
					raise serializers.ValidationError(
						f"Please wait {minutes_remaining} minutes before requesting another reset email."
					)
					
		except User.DoesNotExist:
			raise serializers.ValidationError(
				"No user found with this email address")
		return value

	def save(self):
		try:
			# Generate unique token
			token = default_token_generator.make_token(self.user)
			uid = urlsafe_base64_encode(force_bytes(self.user.pk))

			# Save token to user
			self.user.reset_password_token = token
			self.user.reset_password_expire = datetime.now() + timedelta(hours=1)
			self.user.save()

			# Create reset link
			reset_url = f"https://{settings.DOMAIN_NAME}/reset_password?token={token}&uid={uid}"

			# Create HTML version of the email
			html_message = f'''
			<html>
				<body>
					<h2>Password Reset Request</h2>
					<a href="{reset_url}">Reset Password</a>
					<p>Hello,</p>
					<p>You requested to reset your password. Please click the link below to reset it:</p>
					<h2><a href="{reset_url}">Reset Password</a></h2>
					<p>If you didn't request this, you can safely ignore this email.</p>
					<p>This link will expire in 1 hour.</p>
				</body>
			</html>
			'''

			# Send email with both plain text and HTML versions
			send_mail(
				subject='Password Reset Request',
				message=f'Click the following link to reset your password: {reset_url}',  # plain text version
				html_message=html_message,  # HTML version
				from_email=settings.DEFAULT_FROM_EMAIL,
				recipient_list=[self.user.email],
				fail_silently=False,
			)
			return True

		except Exception as e:
			raise serializers.ValidationError(
				"Error sending reset email. Please try again later.")
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
