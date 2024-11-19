import weakref
from channels.generic.websocket import AsyncWebsocketConsumer


class FourGameOutput:
    consumer_group = {}

    @classmethod
    def add_callback(cls, player_id, consumer, game_obj=None, sendConfig=True) -> None:
        print("add_callback method")
        """
        game_obj is None on connect, But a game instance on reconnect.
        """
        if cls.consumer_group.get(player_id) is None:
            cls.consumer_group[player_id] = weakref.WeakSet()
        cls.consumer_group[player_id].add(consumer)
        # print(f"call back added for player --> {player_id} --> {cls.consumer_group.get(player_id)}")

    @classmethod
    def send_update(cls, player_id, frame) -> None:
        # print(f"send method of remoteGameOutput class, frame --> {frame}")
        data = {'update': frame}
        cls._send_to_consumer_group(player_id, data) 
    
    
    @classmethod 
    def _send_to_consumer_group(cls, player_id, data) -> None:
        # print(f"_send_to_consumer_group method ----> {player_id} --> {data}")
        group = cls.consumer_group.get(player_id)
        if group is None:  
            print(f"Group is None for player {player_id}")  
            return   
        for consumer in group: 
            # print(f"Sending data to consumer data {data}")
            consumer.send_game_message(data)
            
    @classmethod
    def redirect_to_game_page(cls, player1, player2):
        print(f"redirect_to_game_page method --> {player1} --> {player2}")
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
    