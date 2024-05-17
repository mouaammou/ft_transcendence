from django.db import models
from django.contrib.auth.models import AbstractUser

from django.contrib.auth.hashers import make_password

# Create your models here.

class CustomUser(AbstractUser):
	username = models.CharField(max_length=255, unique=True)
	email = models.EmailField(unique=True)

	def save(self, *args, **kwargs):
		# Hash the password before saving
		if self.password:
			self.password = make_password(self.password)
		super().save(*args, **kwargs)
	def __str__(self):
		return self.username
	
	# Add related_name attributes to avoid clashes with the built-in User model
	groups = None
	user_permissions = None
