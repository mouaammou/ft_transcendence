from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
	username = models.CharField(max_length=255, unique=True, blank=False, null=False)
	email = models.EmailField(unique=True, blank=False, null=False)
	first_name = models.CharField(max_length=255, blank=False)
	last_name = models.CharField(max_length=255, blank=False, unique=True)
	password = models.CharField(max_length=255, blank=False, null=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='avatars/default.png')

	def __str__(self):
		return self.username
	
	# Add related_name attributes to avoid clashes with the built-in User model
	groups = None
	user_permissions = None
