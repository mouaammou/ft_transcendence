from django.db import models
from authentication.models import  CustomUser
from django.utils import timezone
from typing import Iterable
from django.contrib.auth import get_user_model
from datetime import timedelta
import asyncio
import uuid
import random
        
    
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
            ('connect_four', 'Connect_four_game'),
        ], default='local')
    
    finish_type = models.CharField(max_length=20, choices=[
        ('defeat', 'Defeat'),
        ('disconnect', 'Disconnect')
    ], default='defeat')
    
    class Meta:
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


User = get_user_model()

def teen_minutes_ahead():
    return timezone.now() + timedelta(seconds=5)

# class LocalGame(models.Model):
#     user = models.ForeignKey(User, on_delete= models.CASCADE)
#     unique_key = models.CharField(max_length=250, null=True, blank=True)

#     left_player = models.CharField(max_length=250)
#     right_player = models.CharField(max_length=250)
#     left_player_score = models.IntegerField(default=0)
#     right_player_score = models.IntegerField(default=0)
#     winner = models.CharField(max_length=250, null=True, blank=True)

#     # created_at = models.DateTimeField(editable=False, auto_now_add=True)

#     # LocalTounament if the game is tournament game else None
#     tournament = models.ForeignKey('LocalTournament', on_delete=models.CASCADE, null=True, blank=True)


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
    updated_at = models.DateTimeField(editable=False, default=timezone.now)

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
        self.updated_at = timezone.now()
        self.match_index = index + 1
        if index == 7:
            self.finished = True
        
    def shuffle(self):
        if self.match_index != 1: # only on create
            return
        original_nicknames = [
            'match1_nickname1',
            'match1_nickname2',
            'match2_nickname1',
            'match2_nickname2',
            'match3_nickname1',
            'match3_nickname2',
            'match4_nickname1',
            'match4_nickname2',
        ]
        nicknames = [getattr(self, nickname) for nickname in original_nicknames]
        random.shuffle(nicknames)
        print(nicknames)

        for index in range(len(original_nicknames)):
            setattr(self, original_nicknames[index], nicknames[index])
    
    def save(self, *args, **kwargs):
        print("Saving")
        self.shuffle()
        super().save(*args, **kwargs)
    
    def __str__(self) -> str:
        return f"[{self.id}] Local Tournament - {self.title} - {self.match7_winner}"
