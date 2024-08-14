from django.db import models

# Create your models here.
from django.db import models



class Tournament(models.Model):
    tournamentId = models.PositiveBigIntegerField(unique=True) #contain 10 digits,)
    name = models.CharField(max_length=30)