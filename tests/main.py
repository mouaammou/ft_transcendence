import asyncio 
from backend.game.local_game.game import PingPongGame
from backend.game.local_game.eventloop import EventLoopManager

class Utils:

    @staticmethod
    def send_to_user(user_id: int, message: dict):
        print(f"send_to_user({user_id}, {message})")
    
    @staticmethod
    def send_to_unique_id(unique_id: int, message: dict):
        print(f"send_to_unique_id({unique_id}, {message})")
    
    @staticmethod
    def send_message(id, message: dict):
        if isinstance(id, int):
            Utils.send_to_user(id, message)
        elif isinstance(id, str):
            Utils.send_to_unique_id(id, message)
        else:
            raise ValueError(f"Invalid id type: {type(id)}")


class Game(PingPongGame):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.tourn_obj = None
        self.match_index = 1
        self.unique_id = None
        self.winner = None
        self.left_nickname = None
        self.right_nickname = None
        self.game_type = 'tournament' or 'regular'
    



# will go and make eventloop inherit from this class, after finishing the implementation
class Manager(EventLoopManager, Utils):

    def __init__(self):
        self.game_obj: Game = None

    def run_tournament(self):
        self.tourn_obj = tourn_obj
        self._event_loop_task = asyncio.create_task(self._event_loop())

    





async def main():
    print('Hello')
    await asyncio.sleep(1)
    print('world')

asyncio.run(main())