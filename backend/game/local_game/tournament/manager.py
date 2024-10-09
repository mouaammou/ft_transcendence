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
# from game.local_game.middleware import send_to_user


def seconds_until(dt):
    delta = dt - timezone.now()
    return max(int(delta.total_seconds()), 0)


class TournamentMonitor:

    event_loop_cls = None # in case i need to use it
    monitor_task = None # keep strong reference to the task
    interval = 30 # seconds

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

class TournamentEventLoopManager:
    event_loop_cls = None

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        # self.game_obj = self.event_loop_cls.game_class()
        self.accepted = True # set it to False
        self.unique_key = '8c1292d3-0f3e-4f9f-b3ba-de529ce1ba0c'
        self.game_finished = False
        self.game_winner = None
    
    def set_accepted(self, unique_key):
        self.accepted = True
        self.unique_key = unique_key
        print(f"Unique Key: {self.unique_key}")
    
    def set_unique_key(self, key):
        self.unique_key = key
    
    def set_game_finished(self):
        self.game_finished = True
    
    def set_game_winner(self, winner):
        self.game_winner = winner
    
    def reset_to_default(self):
        self.game_obj = self.event_loop_cls.game_class()
        # self.accepted = False
        # self.unique_key = None
        self.game_finished = False
        self.game_winner = None


class Tournament(TournamentEventLoopManager):

    tournament_model_class = None
    notification_model_class = None
    pre_match_wait_time = timedelta(seconds=10).total_seconds()
    send_to_user_callback = None # callback

    def __init__(self, tournament_obj: LocalTournament, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.tourn_obj = tournament_obj
        self.match_index = self.tourn_obj.match_index
        print(f"Match Index ==============: {self.match_index}")
        # self.rounds = self._get_round_players()
        # print(f"{self.match_index} Rounds: ", self.rounds)
        self.tournament_start_date = seconds_until(tournament_obj.start_at) # use tournament_obj.start_date
        self.user_id = self.tourn_obj.user_id
        # print("User ID: ", self.user_id)
        asyncio.create_task(self.run_match_task())

    
    def send_to_user(self, message: dict):
        # print('************* Sending Notification *************')
        data = {'tournament': message}
        self.send_to_user_callback(self.user_id, data)
    
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
        """wait for the match to finish by checking the game_finished flag"""
        # print(f"Match {player1} vs {player2} started")
        # await asyncio.sleep(5) # match is palying now
        if self.unique_key is None:
            # print("*********** Unique Key is None ************")
            ValueError("Unique Key is None")
            return
        self.event_loop_cls.remove(self.unique_key)
        self.game_obj = self.event_loop_cls.add(self.unique_key)
        print(f"Game Object: {self.game_obj}")
        self.game_obj.left_nickname = player1
        self.game_obj.right_nickname = player2
        self.game_obj.game_mode = 'tournament'
        a=self.event_loop_cls.play(self.unique_key)
        print('*********** Game Started ************: ', a)
        print(f"{self.game_obj.right_nickname} VS {self.game_obj.left_nickname}")
        print(f"start: {self.game_obj.start_game}")
        print(f"Match {self.match_index} started")
        for _ in range(10):
            # self.accepted = randint(0, 4)
            if self.game_finished or not self.accepted:
                break
            print("+++++++++++++++++++++++++++++++++++++")
            await asyncio.sleep(1)
        # print(f"[Played Match] Winner: {winner}")
        # print(f"Match {self.match_index} ended")
        data = {
            f'match {self.match_index}': f'Match Ended: winner -> {self.game_winner}',
            'winner': self.game_winner,
        }
        self.send_to_user(data)
        return self.game_winner # return winner
    
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
        for _ in range(int(self.pre_match_wait_time)):
            # self.accepted = randint(0, 4)
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
        else:
            # notify about the auto win
            pass
        await asyncio.sleep(self.pre_match_wait_time) # Notify Players  before match starts
        await self.wait_accept()
        
        # await asyncio.sleep(self.start_time) # even if its None Wait for the match Time
        print(f"-#-#-#-#-------- Players: {players}, {self.accepted} --------------")
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
            print(f"######Match {self.match_index} - winner: {winner}")
            # self.rounds.append(winner)
            # self.matches.append(winner)
            await self.save_match_winner(winner)
        self.match_index += 1
        
        self.reset_to_default()

        if self.match_index <= 7:
            await self.run_match_task()
        else:
            await self.tournament_finished()


 
class TournamentManager(TournamentMonitor):
    """
    :param key: unique login key of whom created the tournament
    :param value: tournament class instance

    when a tournament is created reload.
    """
    model_class:LocalTournament  = LocalTournament
    tournaments_objs = set() # list of tournaments models
    tournaments =  {}
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
            __class__.tournaments[tourn_obj.id] = Tournament(tourn_obj)
    

    # for gam_obj in games
    # self.accepted = False
    # self.unique_key = None
    # self.game_finished = False
    # self.game_winner = None
    @classmethod
    def user_accept(cls, unique_key, tournament_id):
        try:
            tourn = list(cls.tournaments.items())[0][1]
        except:
            print("[Tournament] ************** No Tournaments **************")
            return False
        # print(f"tourn = {tourn}")
        # tourn: Tournament = cls.tournaments.get(tid)
        if tourn is None:
            print("[Tournament] ************** Not Found **************")
            return False
        # if tourn.accepted:
        #     print("[Tournament] ************** Already In Playing State **************")
        #     return False
        if __class__.tournaments.get(unique_key) is None:
            tourn.set_accepted(unique_key)
            __class__.tournaments[unique_key] = tourn
        return True

    # @classmethod
    # def match_accepted(cls, loop_cls, tid, unique_key):
    #     tourn: Tournament = cls.tournaments.get(tid)
    #     if tourn is None:
    #         print("[Tournament] ************** Not Found **************")
    #         return False
    #     if cls.tournaments.get(unique_key) is not None:
    #         print("[Tournament] ************** Already Accepted Or Another One Is Runing **************")
    #         return False
    #     tourn.accepted = True
    #     tourn.unique_key = unique_key
    #     __class__.tournaments[unique_key] = tourn
    #     return True
    #     # del __class__.tournament[tid]
    
    @classmethod
    def match_finished(cls, unique_key, winner):
        tourn: Tournament = cls.tournaments.get(unique_key)
        if tourn is None:
            print("************** Tournament Not Found **************")
            return False
        tourn.game_winner = winner
        tourn.set_game_finished()
        print(f"************** Match Finished {winner}, {unique_key}**************")
        # del __class__.tournament[tid]
        return True

    
    # @classmethod
    # def try_add_new_tournament(cls, tourn_obj):
    #     now = timezone.now()
    #     interval = now + timedelta(seconds=TournamentMonitor.interval + 10)
    #     if tourn_obj.start_at < interval and tourn_obj not in __class__.tournaments_objs:
    #         __class__.tournaments_objs.add(tourn_obj)
    #         __class__.tournaments.add(Tournament(tourn_obj))
    