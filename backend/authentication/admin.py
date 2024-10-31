from django.contrib import admin
from .models import CustomUser, Friendship, NotificationModel

admin.site.register(CustomUser)
admin.site.register(Friendship)
admin.site.register(NotificationModel)

# Register your models here.
