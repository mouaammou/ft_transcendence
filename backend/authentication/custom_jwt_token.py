from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import uuid

class CustomToken(TokenObtainPairSerializer):
	@classmethod
	def get_token(cls, user):
		# Get the standard token
		token = super().get_token(user)

		# Add the custom claim to the token
		token['channel_name'] = str(uuid.uuid4())

		return token
