import random
from django.core.management.base import BaseCommand
from faker import Faker
from game.models import LocalTournament as Tournament, User

fake = Faker()

class Command(BaseCommand):
    help = "Populate the Tournament model with fake data"

    def handle(self, *args, **kwargs):
        user = User.objects.first()
        for _ in range(20):  # Adjust to the number of records you want to generate
            title = fake.word().capitalize() + " " + fake.word().capitalize()
            tournament = Tournament.objects.create(
                user=user,
                title=title,
                match1_nickname1=fake.first_name(),
                match1_nickname2=fake.first_name(),
                match2_nickname1=fake.first_name(),
                match2_nickname2=fake.first_name(),
                match3_nickname1=fake.first_name(),
                match3_nickname2=fake.first_name(),
                match4_nickname1=fake.first_name(),
                match4_nickname2=fake.first_name(),
            )
            self.stdout.write(self.style.SUCCESS(f"Created tournament {tournament.title}"))
