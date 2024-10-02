import time
import asyncio
from .game import RemoteGameLogic
from .input_output import OutputManager, InputManager
from  game.models import GameHistory
from channels.db import database_sync_to_async
from authentication.models import CustomUser
from asgiref.sync import sync_to_async

# player_manager.py
class PlayerManager:
    @classmethod
    def reconnect(cls, player_id, consumer):
        from .event_loop import EventLoopManager  # Local import
        game_obj = EventLoopManager.active_players.get(player_id)
        if game_obj is None:
            return False
        game_obj.play()
        OutputManager.add_callback(player_id, consumer, game_obj=game_obj)
        game_obj.disconnected = False
        return True

    @classmethod
    def clean_finished_players(cls, finished_players):
        from .event_loop import EventLoopManager  # Local import
        for player_id in finished_players:
            EventLoopManager.active_players.pop(player_id, None)
        finished_players.clear()

    @classmethod
    def already_in_game(cls, player_id, event_dict):
        from .event_loop import EventLoopManager  # Local import
        game = EventLoopManager.active_players.get(player_id)
        if not game:
            return False
        is_remote = event_dict.get('remote')
        if not is_remote:
            return False
        is_random = is_remote.get('mode')
        if is_random and game.is_fulfilled() and game.islaunched:
            data = {'status': 'already_in_game'}
            OutputManager.send(player_id, data)
            return True
        return False