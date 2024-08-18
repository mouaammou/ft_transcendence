"""
game modes:
    - remote
    - local

input events:
    - onPress:
        call: game.on_press('left|right', key)
    - onRelease
        call: game.on_release('left|right', key)

output events:
    - left_paddle_pos
    - right_paddle_pos
    - right_player_score
    - left_player_score
    - ball_pos
    - finished
"""

import asyncio

class GameInputMiddleware:

    @classmethod
    def send(cls, user_id) -> None:
        pass

    @classmethod
    def userid_to_gameid(cls, user_id) -> int:
        pass

class GameOutputMiddleware:

    @classmethod
    def send(cls, game_id) -> None:
        pass

    @classmethod
    def gameid_to_userid(cls, game_id) -> int:
        pass

# class GameInputOutputMiddlware:
#     pass

class UserManager:
    
    @classmethod
    def userid_to_gameid(cls, user_id) -> int:
        pass

class GameManager:

    @classmethod
    def start(gid):
        pass

    @classmethod
    def stop(gid):
        pass

    @classmethod
    def remove(gid):
        pass

class EventLoopManager:
    runing = {}
    finished = []
    game_class = None

    @classmethod
    def event_loop(cls):
        while True:
            cls.update()
            cls.clean()
            asyncio.sleep(1/60)

    @classmethod
    def update(cls, game):
        for gid, game in cls.runing.items():
            frame:dict = game.update()
            if frame.get('finished'):
                cls.finished.append(gid)
            GameOutputMiddleware.send(frame)

    @classmethod
    def clean(cls, game):
        # finished games here
        for gid in cls.finished:
            cls.runing.pop(gid)

    
    @classmethod
    def add(cls, game):
        pass

class GameEngine:
    pass