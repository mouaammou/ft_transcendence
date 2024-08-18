from channels.layers import get_channel_layer
import asyncio

# i will store a unique value in each jwt token payload each time
# no matter if its the same user its always gonna be unique

# on login remove already existing channels with the unique name
# to avoid any issue
# when user logsout the disconnect method is called

# we should use as channel name: f"channel_name_{user_id}"
# and then call this method on the consumer: send_message(self, event) 
# and then use the key 'game_message' to get the message from event


class LocalGameOutputMiddleware:
    channel_layer = get_channel_layer()

    @classmethod
    async def send_to_channel(cls, jwt_channel_name, message):
        await cls.channel_layer.send(
            jwt_channel_name,
            {
                'type': 'send_message',
                'game_message': message
            }
        )
    
    @classmethod
    def send(cls, jwt_channel_name, frame):
        task = cls.send_to_channel(jwt_channel_name, frame)
        asyncio.create_task()



class EventLoopManager:
    runing = {} # channel name as an id for every game
    finished = []

    @classmethod
    def _event_loop(cls):
        while True:
            cls._update()
            cls._clean()
            asyncio.sleep(1/60)

    @classmethod
    def _update(cls, game):
        for jwt_channel_name, game in cls.runing.items():
            frame:dict = game.update()
            if game.is_finished():
                cls.finished.append(jwt_channel_name)
            LocalGameOutputMiddleware.send(jwt_channel_name, frame)

    @classmethod
    def _clean(cls, game):
        # finished games here
        for jwt_channel_name in cls.finished:
            cls.runing.pop(jwt_channel_name)

    
    @classmethod
    def add(cls, jwt_channel_name, game_obj):
        cls.runing[jwt_channel_name] = game_obj
    
    @classmethod
    def remove(cls, jwt_channel_name):
        cls.runing.pop(jwt_channel_name)
    
    @classmethod
    def stop(cls, jwt_channel_name):
        game_obj = cls.runing.get(jwt_channel_name)
        if game_obj:
            game_obj.pause()
            return True
        return False

    @classmethod
    def play(cls, jwt_channel_name):
        game_obj = cls.runing.get(jwt_channel_name)
        if game_obj:
            game_obj.play()
            return True
        return False
