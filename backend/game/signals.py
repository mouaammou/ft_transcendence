from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LocalTournament
from .local_game.tournament.manager import TrournamentManager
import asyncio

@receiver(post_save, sender=LocalTournament)
def update_tournament_monitor(sender, instance, created, **kwargs):
    """
    when a tournament is created reload.
    """
    if created:
        print("************* Tournament Created ********")
        # try:
        #     task = TrournamentManager.reload_new_tournaments()
        #     asyncio.get_event_loop().create_task(task)
        # except Exception as e:
        #     print(e)
        