
import time
import asyncio
from .game import RemoteGameLogic
# from .input_output import RemoteGameInput, RemoteGameOutput
from  game.models import GameHistory
from channels.db import database_sync_to_async
from authentication.models import CustomUser
from .input_output import OutputManager, InputManager

from asgiref.sync import sync_to_async
# game_manager.py
class GameManager:
    @classmethod
    def update_games(cls):
        from .event_loop import EventLoopManager  # Local import
        for game in EventLoopManager.running_games.values():
            if not game.is_fulfilled():
                continue
            frame = game.update()
            OutputManager.dispatch_events(game, frame)

    @classmethod
    def clean_finished_games(cls, finished_games):
        from .event_loop import EventLoopManager  # Local import
        for game in finished_games:
            EventLoopManager.running_games.pop(game, None)
        finished_games.clear()

    @classmethod
    async def save_history(cls, game_obj, disconnect=False):
        cls.determine_winner(game_obj)
        from .event_loop import EventLoopManager  # Local import
        from channels.db import database_sync_to_async
        from authentication.models import CustomUser  # Assuming this is needed
        player_1_instance = await sync_to_async(CustomUser.objects.get)(id=game_obj.player_1)
        player_2_instance = await sync_to_async(CustomUser.objects.get)(id=game_obj.player_2)

        reason = 'defeat' if not disconnect else 'disconnect'
        await database_sync_to_async(GameHistory.objects.create)(
            player_1=player_1_instance,
            player_2=player_2_instance,
            player_1_score=game_obj.left_player.score, 
            player_2_score=game_obj.right_player.score,
            winner_id=game_obj.winner,
            loser_id=game_obj.loser,
            game_type='Remote',
            finish_type=reason
        )
        EventLoopManager.finished_players.extend([game_obj.player_1, game_obj.player_2])
        EventLoopManager.finished_games.append(game_obj)

    @classmethod
    def determine_winner(cls, game_obj):
        game_obj.determine_winner_loser()