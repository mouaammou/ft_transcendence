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
        on_delete=models.CASCADE,
        related_name='as_player_2'
    )
    
    player_1_score = models.IntegerField(null=True)
    player_2_score = models.IntegerField(null=True)

    winner_id = models.IntegerField(null=True) 
    loser_id = models.IntegerField(null=True)

    game_type = models.CharField(max_length=20, choices=[
            ('local', 'Local'),
            ('vs_friend', 'Remote_vs_friend'),# remote game with a friend or a random player
            ('random', 'Random_remote_game'),# remote game with a friend or a random player
            ('tournament', 'Remote_tournament'),
        ], default='local')
    
    finish_type = models.CharField(max_length=20, choices=[
        ('defeat', 'Defeat'),
        ('disconnect', 'Disconnect')
    ], default='defeat')
    
    
    
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
    

class TournamentHistory(models.Model):
    id = models.CharField(default=uuid.uuid4, primary_key=True, editable=False, max_length=255)
    name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    players = models.ManyToManyField(
        CustomUser,
        related_name='get_tournaments',
    )
    # how to save a list of players objects in the database
    # players_objects = models.ManyToManyField(
    #     CustomUser[max_players],
    #     related_name='get_tournaments_objects',

    # )
    
        

    winner = models.ForeignKey(
        CustomUser,#do nothing on delete
        on_delete=models.DO_NOTHING,
        related_name='get_wins_tournaments',
        null=True,
        blank=True
    )

    organizer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='get_tournaments_organized',
        null=False,
        blank=False
    )

    status = models.CharField(max_length=255, choices=[
        ('pending', 'Waiting for players'),
        ('started', 'Started and running the rounds'),
        ('ended', 'Ended')
    ])

    max_players = models.PositiveIntegerField(default=8)
    def __str__(self):
        return f"Tournament {self.id}"
    
    class Meta:
        pass


# create a model for the tournament and the round
# the round model should have a foreign key to the tournament model, so we can get the rounds of a tournament, and 
# the round model should contain the number of players, and the players, and the status of the round (quarter, semi-final, final), and the winner or winners of the round
 
class RoundHistroy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    tournament = models.ForeignKey(
        TournamentHistory,
        on_delete=models.CASCADE,
        related_name='get_rounds'
    )
    
    players = models.ManyToManyField(
        CustomUser,
        related_name='get_rounds'
    )
    
    winner = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='get_winning_rounds',
        null=True,
        blank=True
    )
    # it has to be a list of winners
    # winners = models.ManyToManyField(
    #     CustomUser,
    #     related_name='get_winning_rounds',
    #     null=True,
    #     blank=True
    # )
    
    status = models.CharField(max_length=255, choices=[
        ('quarter', 'Quarter'),
        ('semi-final', 'Semi-final'),
        ('final', 'Final')
    ])
    
    def __str__(self):
        return f"Round {self.id}"
    
    class Meta:
        pass