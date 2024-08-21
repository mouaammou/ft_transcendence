import requests
from django.db import models
from django.core.files import File
from PIL import Image, UnidentifiedImageError
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.core.files.temp import NamedTemporaryFile
from django.conf import settings

# Create your models here.

# class of the model Friends, Many to Many
class Friendship(models.Model):
	user1 = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		related_name='friendship',
		on_delete=models.CASCADE
	)

	user2 = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		related_name="friends",
		on_delete=models.CASCADE
	)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = (('user1', 'user2'))
	
	def save(self, *args, **kwargs):
		if self.user1.id > self.user2.id:
			self.user1.id, self.user2.id = self.user2.id, self.user1.id
		super(Friendship, self).save(*args, **kwargs)

	def __str__(self):
		return f"{self.user1.username} is friends with {self.user2.username}"
# +++++++++ done model Friendship ++++++++++++#

def validate_image_size(image):
    max_size = 50 * 1024 * 1024  # 50MB
    if image.size > max_size:
        raise ValidationError("Image size should not exceed 50MB")

def upload_location(instance, filename):
	filename = instance.username +"."+ filename.split(".")[-1]
	return f"avatars/{filename}"

# class of the model CustomUser, override the User model class
class CustomUser(AbstractUser):
	username = models.CharField(max_length=255, unique=True, blank=False, null=False)
	user42 = models.CharField(max_length=255, unique=True, blank=True, null=True)
	email = models.EmailField(unique=True, blank=False, null=False)
	first_name = models.CharField(max_length=255, blank=False)
	last_name = models.CharField(max_length=255, blank=False)
	phone = models.CharField(max_length=255, blank=True)
	level = models.IntegerField(default=0)
	password = models.CharField(max_length=255, blank=False, null=False)
	avatar = models.ImageField(upload_to=upload_location, blank=True, null=True, default="avatars/default")
	is_online = models.BooleanField(default=False)

	
	def download_and_save_image(self, image_url):#for 42 image

		img_temp = NamedTemporaryFile(delete=True)
		#download the image form the url
		response = requests.get(url=image_url)
		if response.status_code == 200:
			img_temp.write(response.content)
			img_temp.flush()

			#valid the file is and actual image file
			try:
				img = Image.open(img_temp)
				img.verify()
				img_temp.seek(0)
				self.avatar.save(f"{self.username}.{img.format.lower()}", File(img_temp), save=True)
				print("\n download success -- \n")
			except UnidentifiedImageError:
				print("The file downloaded is not a valid image.")

	def __str__(self):
		return self.username
# +++++++++ done model CustomeUser ++++++++++++#

