from django.db import models
from authentication.models import CustomUser

import uuid

class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    player1 = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='as_player1'
    )
    player2 = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='as_player2'
    )
    winner = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='won_games',
        null=True,
        blank=True
    )
    is_fulfilled = models.BooleanField(default=False)
    is_finished = models.BooleanField(default=False)
    score_player1 = models.IntegerField(default=0)
    score_player2 = models.IntegerField(default=0)

    @property
    def winner_id(self):
        if self.winner:
            return self.winner.id
        elif self.score_player1 == self.score_player2:
            return None  # Indicates a draw
        else:
            return self.player1.id if self.score_player1 > self.score_player2 else self.player2.id
        

    class Meta:
        unique_together = ('player1', 'player2', 'is_finished')