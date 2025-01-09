from django.contrib import admin

# Register your models here.
from .models import GameHistory, TournamentHistory, RoundHistroy, LocalTournament

admin.site.register(GameHistory)
admin.site.register(TournamentHistory)
admin.site.register(RoundHistroy)
admin.site.register(LocalTournament)