from .models import CustomUser
from rest_framework import serializers
from django.conf import settings
from django.db import IntegrityError


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
    def update(self, instance, validated_data):
        # Update fields other than password
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)  # Hash the password
            else:
                setattr(instance, attr, value)  # Update other fields
        
        instance.save()  # Save the updated instance
        return instance
    #     try:
    #         for attr, value in validated_data.items():
    #             setattr(instance, attr, value)
    #         instance.save()
    #         return instance
    #     except IntegrityError as e:
    #         if 'unique constraint' in str(e).lower():
    #             if 'username' in str(e).lower():
    #                 raise serializers.ValidationError({"username": str(e)})
    #             elif 'email' in str(e).lower():
    #                 raise serializers.ValidationError({"email": str(e)})
    #         raise serializers.ValidationError("An error occurred while updating the user.")

# class UserUPdateSerializer(serializers.ModelSerializer):

#     class Meta:
#         fields = ["username", "email", "first_name", "last_name"]
    
#     def update(self, instance, validated_data):
#         try:
#             instance.username = validated_data.get('username', instance.username)
#             instance.email = validated_data.get('email', instance.email)
#             instance.first_name = validated_data.get('first_name', instance.first_name)
#             instance.last_name = validated_data.get('last_name', instance.last_name)

#             instance.save()

#         except IntegrityError as error:
#             if 'unique constraint' in str(error).lower():
#                 raise serializers.ValidationError({"username": "this username is already in user"})
#             elif 'email' in str(error).lower():
#                 raise serializers.ValidationError({"email": "This email is already in use."})
#             raise serializers.ValidationError("An error occurred while updating the user.")