import requests
from django.db import models
from django.core.files import File
from PIL import Image, UnidentifiedImageError
from django.core.exceptions import ValidationError
from django.contrib.auth.models import AbstractUser
from django.core.files.temp import NamedTemporaryFile
from django.conf import settings
from django.db.models import Q
from django.utils import timezone

#---------------- Notifications model ===================#
class Notification(models.Model):

	NOTIFICATION_TYPES = (
		('friend', 'friend'),
		('game', 'game'),
		('tournament', 'tournament'),
	)
	NOTIFICATION_STATUS = (
		('pending', 'pending'),
		('accepted', 'accepted'),
	)
	sender = models.ForeignKey(
			settings.AUTH_USER_MODEL, 
			related_name="notifications_sent",  # Custom reverse accessor for sender
			on_delete=models.CASCADE
		)
	receiver = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		related_name="notifications_received",  # Custom reverse accessor for receiver
		on_delete=models.CASCADE
	)
	message = models.CharField(max_length=70, blank=False, null=False)
	created_at = models.DateTimeField(auto_now_add=True)
	is_read = models.BooleanField(default=False)
	notif_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='friend')
	notif_status = models.CharField(max_length=10, choices=NOTIFICATION_STATUS, default='pending')

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f'Notification for {self.receiver.username}'
	
	def accept(self):
		"""Handle acceptance based on notification type."""
		if self.notif_type == 'friend':
			# Accept the friendship
			Friendship.objects.create(sender=self.sender, receiver=self.receiver, status='accepted')

		elif self.notif_type == 'game':
			# Add logic for accepting game invite
			pass

		elif self.notif_type == 'tournament':
			# Add logic for accepting tournament invite
			pass

		self.notif_status = 'accepted'
		self.save()
#---------------- # Notifications model ===================#


# ----------------- model Frienship -----------------#  

class Friendship(models.Model):
	STATUS_CHOICES = (
		('accepted', 'accepted'),
		('blocked', 'blocked'),
	)

	sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="sender", on_delete=models.CASCADE)
	receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="receiver", on_delete=models.CASCADE, null=True)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('sender', 'receiver')

	def clean(self):
		if self.sender == self.receiver:
			raise ValidationError("Sender and receiver cannot be the same user.")
		if not self.receiver:
			raise ValidationError("Receiver must be provided.")
		if not self.sender:
			raise ValidationError("The sender cannot be null.")

	def save(self, *args, **kwargs):
		self.clean()
		reciprocal = Friendship.objects.filter(sender=self.receiver, receiver=self.sender).first()

		super().save(*args, **kwargs)
		# Create reciprocal friendship if needed
		if self.status in ('accepted', 'blocked') and (not reciprocal or reciprocal.status != self.status):
			Friendship.objects.update_or_create(
				sender=self.receiver,
				receiver=self.sender,
				defaults={'status': self.status}
			)

	def delete(self, *args, **kwargs):
		Friendship.objects.filter(sender=self.receiver, receiver=self.sender).delete()
		super().delete(*args, **kwargs)

	def accept(self):
		if self.status != 'pending':
			raise ValidationError("This request already passed")
		self.status = 'accepted'
		self.save()

	def block(self, *args, **kwargs):
		if self.status == 'accepted':
			self.status = 'blocked'
			self.save()

	def __str__(self):
		return f"{self.sender} is friend with {self.receiver}, friend status: {self.status}"

# ----------------- # model Frienship -----------------#


def validate_image_size(image):
	max_size = 50 * 1024 * 1024  # 50MB
	if image.size > max_size:
		raise ValidationError("Image size should not exceed 50MB")

def upload_location(instance, filename):
	filename = instance.username +"."+ filename.split(".")[-1]
	return f"avatars/{filename}"

# class of the model CustomUser, override the User model class
class CustomUser(AbstractUser):
	username = models.CharField(max_length=8, unique=True, blank=False, null=False)
	user42 = models.CharField(max_length=10, unique=True, blank=True, null=True)
	email = models.EmailField(unique=True, blank=False, null=False)
	totp_secret = models.CharField(max_length=32, blank=True, null=True)
	totp_enabled = models.BooleanField(default=False)
	first_name = models.CharField(max_length=12, blank=False)
	last_name = models.CharField(max_length=12, blank=False)
	phone = models.CharField(max_length=255, blank=True)
	level = models.IntegerField(default=0)
	password = models.CharField(max_length=255, blank=False, null=False)
	avatar = models.ImageField(upload_to=upload_location, blank=True, null=True, default="avatars/default.png")

	status = models.CharField(max_length=255, default="offline")

	friends = models.ManyToManyField('self', through='Friendship', blank=True)

	def get_friends(self):
		return CustomUser.objects.filter(
			Q(sent_friendships__receiver=self, sent_friendships__status='accepted') |
			Q(received_friendships__sender=self, sent_friendships__status='accepted')
		)

	def get_blocked(self):
		return CustomUser.objects.filter(
			Q(sent_friendships__receiver=self, sent_friendships__status='blocked') |
			Q(received_friendships__sender=self, sent_friendships__status='blocked')
		)

	def download_and_save_image(self, image_url): # download 42 image
		img_temp = NamedTemporaryFile(delete=True)
		#download the image form the url
		response = requests.get(url=image_url)
		if response.status_code == 200:
			img_temp.write(response.content)
			img_temp.flush()

			# valid the file is and actual image file
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

