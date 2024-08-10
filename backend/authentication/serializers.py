from .models import CustomUser
from rest_framework import serializers
from django.conf import settings


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ("first_name", "last_name", "username", "email", "password", "avatar")
        extra_kwargs = {"username": {"read_only": True}}
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):#maybe you can use the baseMOdelManger for this ??
        return CustomUser.objects.create_user(**validated_data)#use it for hash the password

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['avatar']:
            representation['avatar'] = f"{settings.BACKEND_BASE_URL}{representation['avatar']}"
        return representation

    def validate_email(self, value):
        user = self.instance  # Get the current user instance
        print(f"\n fdf-- {user.email} --\n")
        print(f"\n fdfv-- {value} --\n")
        # if user.email != value:  # Only validate if the email has changed
        if CustomUser.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        user = self.instance  # Get the current user instance
        print(f"\n fdf-- {user.username} --\n")
        print(f"\n fdfv-- {value} --\n")
        # if user.username != value:  # Only validate if the username has changed
        if CustomUser.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

class ImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ["avatar"]

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get("avatar", instance.avatar)
        instance.save()
        return instance