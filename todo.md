- alias names
- who is playing against whom
- the order players



resolve channel name from user_ids


# remove callbacks from middle ware on disconnect
#  this causes the error: trying to send on a closed socket


# when trying to send using callback middleware if there is callback
#        associated with the game you should stop the game.




# on disconnection check if there is more that one consumer for a game
# dont stop it let other consumer play



use a class to store the old unique key so if same user logedin without any unique key
and there is one for him stored, give it back to that user



dont forget, Add a class to Logic game to identify who is playing against whom.

moha: if a user go directly to the game page, i will check for his opponent if not found, i will direct him to play page










def handle_tournament(cls, event_dict, player_id): --> cls.players_in_tournaments, 

def broadcast_tournaments(cls):                          --> cls.active_tournaments

def handle_join_tournament(cls, event_dict, player_id): --> cls.active_tournaments

def start_tournament(cls, player_id): ---> cls.players_in_tournaments, cls.active_tournaments, cls.running_games, cls.active_players

def send_tournament_players(cls, player_id): --> cls.active_tournaments

def send_to_consumer_group(cls, player_id, status): --> RemoteGameOutput._send_to_consumer_group(player_id, { 'status': status })

def create_tournament(cls, player_id, tournament_name): --> cls.active_tournaments, cls.players_in_tournaments
- alias names
- who is playing against whom
- the order players



resolve channel name from user_ids


# remove callbacks from middle ware on disconnect
#  this causes the error: trying to send on a closed socket


# when trying to send using callback middleware if there is callback
#        associated with the game you should stop the game.




# on disconnection check if there is more that one consumer for a game
# dont stop it let other consumer play



use a class to store the old unique key so if same user logedin without any unique key
and there is one for him stored, give it back to that user



dont forget, Add a class to Logic game to identify who is playing against whom.
