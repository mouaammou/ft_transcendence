from django.contrib import admin
from .models import CustomUser, Friendship, Notification

admin.site.register(CustomUser)
admin.site.register(Friendship)
admin.site.register(Notification)

# Register your models here.
