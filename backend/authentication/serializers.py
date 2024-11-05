from django.core.exceptions import ValidationError
from .models import CustomUser, Friendship, Notification
from rest_framework import serializers
from django.conf import settings

#-------------- Notificaion Serializer ================#
from rest_framework import serializers

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
