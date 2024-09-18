from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def teen_minutes_ahead():
    return timezone.now() + timedelta(minutes=10)

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
    user = models.ForeignKey(User, on_delete= models.CASCADE)
    unique_key = models.CharField(max_length=250, null=True, blank=True)

    title = models.CharField(max_length=250)

    # round `1` players
    match1_nickname1 = models.CharField(max_length=250)
    match1_nickname2 = models.CharField(max_length=250)

    match2_nickname1 = models.CharField(max_length=250)
    match2_nickname2 = models.CharField(max_length=250)

    match3_nickname1 = models.CharField(max_length=250)
    match3_nickname2 = models.CharField(max_length=250)

    match4_nickname1 = models.CharField(max_length=250)
    match4_nickname2 = models.CharField(max_length=250)

    #2` players
    match5_nickname1 = models.CharField(max_length=250, null=True, blank=True)
    match5_nickname2 = models.CharField(max_length=250, null=True, blank=True)

    match6_nickname1 = models.CharField(max_length=250, null=True, blank=True)
    match6_nickname2 = models.CharField(max_length=250, null=True, blank=True)

    #3` players
    match7_nickname1 = models.CharField(max_length=250, null=True, blank=True)
    match7_nickname2 = models.CharField(max_length=250, null=True, blank=True)

    #round `4` players
    winner_nickname = models.CharField(max_length=250, null=True, blank=True)

    # Date Time
    created_at = models.DateTimeField(editable=False, auto_now_add=True)
    finished = models.BooleanField(default=False)


    # round 0 means the tournament is not started yet
    # we have Four rounds in total
    match_index = models.IntegerField(default=1)
    next_match_should_start_at_most = models.DateTimeField(default=teen_minutes_ahead)
    # match1_finished_at = models.DateTimeField(null=True, blank=True)
    # match2_finished_at = models.DateTimeField(null=True, blank=True)
    # match3_finished_at = models.DateTimeField(null=True, blank=True)
    # match4_finished_at = models.DateTimeField(null=True, blank=True)
    # match5_finished_at = models.DateTimeField(null=True, blank=True)
    # match6_finished_at = models.DateTimeField(null=True, blank=True)
    # match7_finished_at = models.DateTimeField(null=True, blank=True)
    # p1_vs_p2, p3_vs_p4, p5_vs_p6, p7_vs_p8

    def get_next_match(self):
        """
        Note: Once you fetch next match you can't get the same match again.
        it is automaticaly considered as finished, and moves to next one.
        """
        if self.match_index > 7:
            return None
        next_match = {
            'index': self.match_index,
            'should_start_at_most': self.next_match_should_start_at_most,
            'title': self.title,
            'nickname1': getattr(self, f"match{self.match_index}_nickname1"),
            'nickname2': getattr(self, f"match{self.match_index}_nickname2"),
        }
        return next_match

    def set_current_match_as_finished(self, winner_nickname):
        if self.match_index > 7:
            self.finished = True
            self.save()
            return
        setattr(self, f"match{self.match_index}_finished_at", timezone.now()) # i may remove this
        setattr(self, f"match{self.match_index}_nickname{self.match_index % 2 + 1}", winner_nickname)
        setattr(self, f"next_match_should_start_at_most", teen_minutes_ahead())
        self.match_index += 1
        self.save()
    
    def __str__(self) -> str:
        return f"[Local Tournament] - {self.title} - {self.created_at}"
