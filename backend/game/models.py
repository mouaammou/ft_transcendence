from django.db import models
from authentication.models import  CustomUser
from django.utils import timezone

import uuid

# class (models.Model):
#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
   
#     winner = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE,
#         related_name='won_games',
#         null=True,
#         blank=True
#     )
#     score_player_1 = models.IntegerField(default=0)
#     score_player_2 = models.IntegerField(default=0)

#     @property
#     def winner_id(self):
#         if self.winner:
#             return self.winner.id
#         elif self.score_player_1 == self.score_player_2:
#             return None  # Indicates a draw
#         else:
#             return self.player_1.id if self.score_player_1 > self.score_player_2 else self.player_2.id
        

#     class Meta:
#         pass
    
    
    
class GameHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    creation_date = models.DateField(auto_now_add=True)
    creation_time = models.TimeField(auto_now_add=True)
    
    player_1 = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='as_player_1'
    )
     
    player_2 = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE
    )
    
    game_type = models.CharField(max_length=20, choices=[
            ('local', 'Local'),
            ('remote', 'Remote'),
            ('tournament', 'Tournament'),
        ], default='local')
    
    @property
    def game_result(self):
        if self.score_player_1 > self.score_player_2:
            return "win"
        elif self.score_player_1 < self.score_player_2:
            return "lose"
        else:
            return "draw"
    
    
    # def save(self, *args, **kwargs):
    #     # Set the creation_date and creation_time when saving the instance
    #     if not self.pk:  # Only set these if the instance is being created
    #         self.creation_date = self.created_at.date()
    #         self.creation_time = self.created_at.time()
    #     super().save(*args, **kwargs)
    
    class Meta:
        # verbose_name = _("")
        # verbose_name_plural = _("s")
        pass

    def __str__(self):
        return f"Game between {self.player_1} and {self.player_2} - Result: {self.game_result}"
