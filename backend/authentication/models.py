from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# Create your models here.

def validate_image_size(image):
    max_size = 50 * 1024 * 1024  # 50MB
    if image.size > max_size:
        raise ValidationError("Image size should not exceed 50MB")

def upload_location(instance, filename):
	filename = instance.username +"."+ filename.split(".")[-1]
	return f"avatars/{filename}"

class CustomUser(AbstractUser):
	username = models.CharField(max_length=255, unique=True, blank=False, null=False)
	nickname = models.CharField(max_length=255, blank=True)
	email = models.EmailField(unique=True, blank=False, null=False)
	first_name = models.CharField(max_length=255, blank=False)
	last_name = models.CharField(max_length=255, blank=False)
	phone = models.CharField(max_length=255, blank=True)
	level = models.IntegerField(default=0)
	password = models.CharField(max_length=255, blank=False, null=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	avatar = models.ImageField(upload_to=upload_location, blank=True, null=True)
	# ,validators=[validate_image_size], default="avatars/default.png")
	# avatar_url = models.URLField(blank=False, null=False, default="https://www.gravatar.com/avatar/")

	def __str__(self):
		return self.username

