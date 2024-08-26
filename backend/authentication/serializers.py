from .models import CustomUser, Friendship
from rest_framework import serializers
from django.conf import settings
from django.db import IntegrityError

#============= friends Serializer +++++++++++++++
class FriendshipSerializer(serializers.ModelSerializer):
    # friend = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        # fields = ['user1', 'friend', 'created_at']
        fields = ['user1', 'user2', 'created_at']
    

    def create(self, validated_data):
        # Ensure that user1 and user2 are set before saving
        user1 = validated_data.get('user1')
        user2 = validated_data.get('user2')

        # Additional logic can go here if needed
        return Friendship.objects.create(user1=user1, user2=user2)

    # def get_friend(self, obj):
    #     user = self.context['request'].customUser
    #     return obj.user2 if obj.user1 == user else obj.user1
# end friends Serializer ================

#============= CustomeUser Serializer +++++++++++++++
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ("id", "first_name", "last_name", "username", "email", "password", "avatar")
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