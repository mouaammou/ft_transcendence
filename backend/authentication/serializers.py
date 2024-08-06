from .models import CustomUser
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ("first_name", "last_name", "username", "nickname", "email", "password")
        extra_kwargs = {"username": {"read_only": True}}
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)#user it for hash the password

    # def update(self, instance, validated_data):
    #     #update just the fields that are provided
    #     for field in validated_data:
    #         if field == "password":
    #             instance.set_password(validated_data.get("password", instance.password))
    #         else:
    #             setattr(instance, field, validated_data.get(field, getattr(instance, field)))
    #     # instance.first_name = validated_data.get("first_name", instance.first_name)
    #     # instance.last_name = validated_data.get("last_name", instance.last_name)
    #     # instance.username = validated_data.get("username", instance.username)
    #     # instance.email = validated_data.get("email", instance.email)
    #     # instance.avatar = validated_data.get("avatar", instance.avatar)
    #     # instance.avatar_url = validated_data.get("avatar_url", instance.avatar_url)
    #     # instance.set_password(validated_data.get("password", instance.password))
    #     instance.save()
    #     return instance


class ImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ["avatar"]

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get("avatar", instance.avatar)
        instance.save()
        return instance