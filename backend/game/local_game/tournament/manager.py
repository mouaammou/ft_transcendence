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
from random import randint
from game.models import LocalTournament
from game.local_game.middleware import LocalGameOutputMiddleware

def seconds_until(dt):
    delta = dt - timezone.now()
    return max(int(delta.total_seconds()), 0)


class TournamentMonitor:

    event_loop_cls = None # in case i need to use it
    monitor_task = None # keep strong reference to the task
    interval = 30 # (/seconds) means 1 hour

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

    event_loop_class = None
    tournament_model_class = None
    notification_model_class = None
    pre_match_wait_time = timedelta(seconds=10).total_seconds()

    def __init__(self, tournament_obj: LocalTournament) -> None:
        self.tourn_obj = tournament_obj
        self.match_index = self.tourn_obj.match_index
        print(f"Match Index ==============: {self.match_index}")
        # self.rounds = self._get_round_players()
        # print(f"{self.match_index} Rounds: ", self.rounds)
        self.tournament_start_date = seconds_until(tournament_obj.start_at) # use tournament_obj.start_date
        self.user_id = self.tourn_obj.user_id
        # print("User ID: ", self.user_id)
        self.accepted = randint(0, 4)
        asyncio.create_task(self.run_match_task())

    
    def send_to_user(self, message: dict):
        # print('************* Sending Notification *************')
        data = {'tournament': message}
        LocalGameOutputMiddleware.send_to_userid(self.user_id, data)
    
    def _get_match_players(self):
        return self.tourn_obj.get_match_players(self.match_index)
    
    def auto_win(self, winner):
        print(f"[Auto Win] Winner: {winner}")
        data = {
            f'match {self.match_index}': f'Auto Win: winner -> {winner}',
            'winner': winner,
        }
        self.send_to_user(data)
    
    def did_not_accept(self):
        print(f"[Didnt Accept] Winner: None")
        data = {
            f'match {self.match_index}': 'Didnt Accept: winner -> None',
            'winner': None,
        }
        self.send_to_user(data)
    
    def notify_players(self, player1, player2):
        print(f"Notify Players: {player1}, {player2}")
        data = {
            f'match {self.match_index}': f'Notify Players: {player1} VS {player2}',
            'left': player1,
            'right': player2,
        }
        self.send_to_user(data)
        
    
    async def play_match(self, player1, player2):
        # print(f"Match {player1} vs {player2} started")
        winner = (player1, player2)[randint(0, 1)]
        await asyncio.sleep(5) # match is palying now
        # print(f"[Played Match] Winner: {winner}")
        # print(f"Match {self.match_index} ended")
        data = {
            f'match {self.match_index}': f'Match Ended: winner -> {winner}',
            'winner': winner,
        }
        self.send_to_user(data)
        return winner # return winner
    
    async def save_match_winner(self, winner):
        print(f"Match {self.match_index} - winner: {winner} [is saved to database]")
        self.tourn_obj.set_match_winner(self.match_index, winner)
        await self.tourn_obj.asave()
    
    async def tournament_finished(self):
        print("Tournament Finished")
        data = {
            'Finished': f'{self.tourn_obj}',
        }
        self.send_to_user(data)

    async def wait_accept(self):
        for _ in range(self.pre_match_wait_time):
            self.accepted = randint(0, 4)
            if self.accepted:
                break
            await asyncio.sleep(1)


    async def run_match_task(self):
        if self.match_index > 7:
            return
        if self.match_index == 1:
            print("*********** Tournament Started ************")
            # self.tournament_model_class.objects.filter(id=self.tourn_obj.id).update(status="Started")
            await asyncio.sleep(self.tournament_start_date) # wait for 5 seconds
        print("-"*30, f"Match {self.match_index}", "-"*30)
        players = self._get_match_players()
        if None not in players:
            self.notify_players(players[0], players[1])
        await asyncio.sleep(self.pre_match_wait_time) # Notify Players  before match starts
        # await self.wait_accept()
        
        # await asyncio.sleep(self.start_time) # even if its None Wait for the match Time
        if not self.accepted or None in players:
            if None in players:
                winner = players[0] if players[0] else players[1]
                # self.matches.append(self.rounds[-1])
                self.auto_win(winner)
                await self.save_match_winner(winner)
            else:
                winner = None
                # self.matches.append(self.rounds[-1])
                self.did_not_accept()
                await self.save_match_winner(winner)
        else:
            winner = await self.play_match(players[0], players[1])
            # self.rounds.append(winner)
            # self.matches.append(winner)
            await self.save_match_winner(winner)
        self.match_index += 1
        if self.match_index <= 7:
            await self.run_match_task()
        else:
            await self.tournament_finished()


 
class TrournamentManager(TournamentMonitor):
    """
    :param key: unique login key of whom created the tournament
    :param value: tournament class instance

    when a tournament is created reload.
    """
    model_class:LocalTournament  = LocalTournament
    tournaments_objs = set() # list of tournaments models
    tournaments = set()
    allowed_delay = timedelta(minutes=10) # 10 Min : between the time the match should start and the time it actually starts

    @classmethod
    def update(cls):
        super().update()
        asyncio.create_task(cls.reload_new_tournaments())
        # cls.event_loop_cls.output_middlware_class.send_to_userid(1, {'tournament': 'Tournament Monitor Updated'})
    
    @classmethod
    def send_to_user(cls, user_id, message):
        print('************* Sending Notification *************')
        cls.event_loop_cls.output_middlware_class.send_to_userid(user_id, message)

    def get_new_tournaments(interval):
        return list(LocalTournament.objects.filter(
            start_at__lt=interval,
            finished=False,
        ))
    
    @classmethod
    async def reload_new_tournaments(cls):
        """
        await is on purpose:
        - to avoid blocking the event loop, and thread safety.
        """
        print('************* Reloading New Tournaments *************')
        interval = timezone.now() + timedelta(seconds=TournamentMonitor.interval)

        tournaments = await sync_to_async(cls.get_new_tournaments)(interval)
        for tourn_obj in tournaments:
            if tourn_obj in __class__.tournaments_objs:
                continue
            __class__.tournaments_objs.add(tourn_obj)
            __class__.tournaments.add(Tournament(tourn_obj))
    
    # @classmethod
    # def try_add_new_tournament(cls, tourn_obj):
    #     now = timezone.now()
    #     interval = now + timedelta(seconds=TournamentMonitor.interval + 10)
    #     if tourn_obj.start_at < interval and tourn_obj not in __class__.tournaments_objs:
    #         __class__.tournaments_objs.add(tourn_obj)
    #         __class__.tournaments.add(Tournament(tourn_obj))
    
