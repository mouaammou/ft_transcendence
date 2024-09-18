# import uuid

# class UniqueKeyResolverAndGenerator:
#     """
#     Resolve user ids to unique keys, And vise versa.
#     """
#     data = {}

#     @classmethod
#     def resolve_or_generate(cls, user_id):
#         unique_key = cls.data.get(user_id)
#         if unique_key is not None:
#             return 

import asyncio
from game import models
from django.utils import timezone
from datetime import timedelta
from asgiref.sync import sync_to_async

class TournamentMonitor:

    event_loop_cls = None # in case i need to use it
    monitor_task = None # keep strong reference to the task
    interval = 60*60 # (/seconds) means 1 hour

    @classmethod
    def init_monitor(cls, event_loop_cls):
        cls.event_loop_cls = event_loop_cls
        cls._start_monitor_task_chain()
    
    @classmethod
    def _start_monitor_task_chain(cls):
        cls.update()
        loop = asyncio.get_running_loop()
        future_time = loop.time() + cls.interval
        cls.monitor_task = loop.call_at(future_time, cls._start_monitor_task_chain)
    
    @classmethod
    def update(cls):
        """
        To Be Overriden, By Subclass.
        it will be called every interval.
        """
        print('************* Tournament Monitor task updated *************')
        pass


class Tournament:
    chain_task = None
    tournament_obj = None

    # def invalid


 
class TrournamentManager(TournamentMonitor):
    """
    :param key: unique login key of whom created the tournament
    :param value: tournament class instance

    when a tournament is created reload.
    """
    model_class = models.LocalTournament
    tournaments_group = [] # list of tournaments models
    allowed_delay = timedelta(minutes=10) # 10 Min : between the time the match should start and the time it actually starts

    @classmethod
    def update(cls):
        super().update()
        asyncio.create_task(cls.reload_new_tournaments())
        # cls.event_loop_cls.output_middlware_class.send_to_userid(1, {'tournament': 'Tournament Monitor Updated'})
    
    @classmethod
    def send_to_user(cls, user_id, message):
        cls.event_loop_cls.output_middlware_class.send_to_userid(user_id, message)

    @classmethod
    def notify_task(cls, tourn_obj):
        match_time = tourn_obj.next_match_should_start_at_most
        if match_time < timezone.now():
            tourn_obj.set_current_match_as_finished()
            match_time = tourn_obj.next_match_should_start_at_most
        data = {
            'notification': {
                'tournament': tourn_obj.get_next_match(),
            }
        }
        cls.send_to_user(tourn_obj.user_id, data)
    

    async def reload_new_tournaments(self):
        """
        await is on purpose:
        - to avoid blocking the event loop, and thread safety.
        """
        now = timezone.now()
        interval = now + timedelta(seconds=TournamentMonitor.interval + 10)
        tournaments = await sync_to_async(__class__.model_class.objects.filter(
                next_match_should_start_at_most__lt=interval,
                finished=False,
            ).all
        )
        self.tournaments_group.extend(tournaments)

    @classmethod
    def start_tournament(cls, unique_key):
        """
        This mean to start or continue, the tournament
        """
        pass

    @classmethod
    def create(cls, unique_key, *nicknames):
        if len(nicknames) != cls.tournament_size:
            raise ValueError("Not enough nicknames")
        if cls._already_has_one(unique_key):
            return False
        tourn = cls.tournment_class()
        tourn.set_nicknames(*nicknames)
        cls.tournaments_group[unique_key] = tourn
        return True
    
    @classmethod
    def get_tournament(cls, unique_key):
        return cls.tournaments_group.get(unique_key)
    

    @classmethod
    def _already_has_one(cls, unique_key):
        return bool(cls.tournaments_group.get(unique_key))
    
