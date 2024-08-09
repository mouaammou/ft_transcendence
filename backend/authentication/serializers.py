from .models import CustomUser
from rest_framework import serializers
from django.conf import settings


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ("first_name", "last_name", "username", "nickname", "email", "password", "avatar")
        extra_kwargs = {"username": {"read_only": True}}
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):#maybe you can use the baseMOdelManger for this ??
        return CustomUser.objects.create_user(**validated_data)#use it for hash the password

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation['avatar']:
            representation['avatar'] = f"{settings.BACKEND_BASE_URL}{representation['avatar']}"
        return representation


class ImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ["avatar"]

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get("avatar", instance.avatar)
        instance.save()
        return instance