from django.db import models
from django.conf import settings  # Import settings to access AUTH_USER_MODEL

class Message(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='sent_messages',
        on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='received_messages',
        on_delete=models.CASCADE
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    is_read = models.BooleanField(default=False)  # track if the message has been read

    def __str__(self):
        return f'{self.sender} to {self.receiver}: {self.message[:20]}'
