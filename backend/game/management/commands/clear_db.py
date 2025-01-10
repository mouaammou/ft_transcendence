
from django.core.management.base import BaseCommand

from game.models import LocalTournament as Tournament, User



class Command(BaseCommand):
    help = "Populate the Tournament model with fake data"

    def handle(self, *args, **kwargs):
        tournament = Tournament.objects.all().delete()     
        self.stdout.write(self.style.SUCCESS(f"All Local Tournaments have been deleted"))
