from typing import Iterable
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import asyncio

User = get_user_model()

def teen_minutes_ahead():
    return timezone.now() + timedelta(seconds=5)

class LocalGame(models.Model):
    user = models.ForeignKey(User, on_delete= models.CASCADE)
    unique_key = models.CharField(max_length=250, null=True, blank=True)

    left_player = models.CharField(max_length=250)
    right_player = models.CharField(max_length=250)
    left_player_score = models.IntegerField(default=0)
    right_player_score = models.IntegerField(default=0)
    winner = models.CharField(max_length=250, null=True, blank=True)

    created_at = models.DateTimeField(editable=False, auto_now_add=True)

    # LocalTounament if the game is tournament game else None
    tournament = models.ForeignKey('LocalTournament', on_delete=models.CASCADE, null=True, blank=True)


class LocalTournament(models.Model):

    MATCHES = {
        1: ('match1_nickname1', 'match1_nickname2', 'match1_winner'),
        2: ('match2_nickname1', 'match2_nickname2', 'match2_winner'),
        3: ('match3_nickname1', 'match3_nickname2', 'match3_winner'),
        4: ('match4_nickname1', 'match4_nickname2', 'match4_winner'),
        5: ('match1_winner', 'match2_winner', 'match5_winner'),
        6: ('match3_winner', 'match4_winner', 'match6_winner'),
        7: ('match5_winner', 'match6_winner', 'match7_winner'),
    }

    user = models.ForeignKey(User, on_delete= models.CASCADE, )

    title = models.CharField(max_length=250)
    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    start_at = models.DateTimeField(default=teen_minutes_ahead)
    finished = models.BooleanField(default=False, editable=False)

    # round `1` players
    match1_nickname1 = models.CharField(max_length=250,)
    match1_nickname2 = models.CharField(max_length=250,)
    match2_nickname1 = models.CharField(max_length=250,)
    match2_nickname2 = models.CharField(max_length=250,)
    match3_nickname1 = models.CharField(max_length=250,)
    match3_nickname2 = models.CharField(max_length=250,)
    match4_nickname1 = models.CharField(max_length=250,)
    match4_nickname2 = models.CharField(max_length=250,)

    #2` players
    match2_winner = models.CharField(max_length=250, null=True, editable=False)
    match1_winner = models.CharField(max_length=250, null=True, editable=False)
    match3_winner = models.CharField(max_length=250, null=True, editable=False)
    match4_winner = models.CharField(max_length=250, null=True, editable=False)
    match5_winner = models.CharField(max_length=250, null=True, editable=False)
    match6_winner = models.CharField(max_length=250, null=True, editable=False)
    match7_winner = models.CharField(max_length=250, null=True, editable=False)
    
    match_index = models.IntegerField(default=1, editable=False)

    def get_match_players(self, index):
        if index > 7:
            return ValueError("Invalid Match Index")
        left, right, winner = self.MATCHES[index]
        return getattr(self, left), getattr(self, right)
    
    def set_match_winner(self, index, winner) -> None:
        if index > 7:
            return ValueError("Invalid Match Index")
        left, right, match_winner = self.MATCHES[index]
        setattr(self, match_winner, winner)
        self.match_index = index + 1
        if index == 7:
            self.finished = True
    
    def __str__(self) -> str:
        return f"[{self.id}] Local Tournament - {self.title} - {self.match7_winner}"
