import weakref
from channels.generic.websocket import AsyncWebsocketConsumer


class FourGameOutput:
    consumer_group = {}

    @classmethod
    def add_callback(cls, player_id, consumer, game_obj=None, sendConfig=True) -> None:

        """
        game_obj is None on connect, But a game instance on reconnect.
        """
        if cls.consumer_group.get(player_id) is None:
            cls.consumer_group[player_id] = weakref.WeakSet()
        cls.consumer_group[player_id].add(consumer)


    @classmethod
    def send_update(cls, player_id, frame) -> None:

        data = {'update': frame}
        cls._send_to_consumer_group(player_id, data) 
    
    
    @classmethod 
    def _send_to_consumer_group(cls, player_id, data) -> None:

        group = cls.consumer_group.get(player_id)
        if group is None:  
  
            return   
        for consumer in group: 

            consumer.send_game_message(data)
            
    @classmethod
    def redirect_to_game_page(cls, player1, player2):

        data = {
                'type': 'redirect_to_game_page',
                'opponent': player2  
                    }
        cls._send_to_consumer_group(player1, data)
        data2 = {
                'type': 'redirect_to_game_page',
                'opponent': player1
                    }
        cls._send_to_consumer_group(player2, data2)
    