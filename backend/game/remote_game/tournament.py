# tournament brainstorming
# 1. create a tournament object
# 2. add players to the tournament
# 3. start the tournament
# 4. handle disconnection
# 5. handle reconnection
# 6. handle game over
# 7. handle game start
# 8. handle game end
# 9. handle game timeout
# 10. register for tournament
# 11. tournament status
# 12. _ i have to create four three types (opening round, semi-final round, 
# and the final round), each one have number of players(8, 4, 2), and I have to save them in the database (in the tournament if a round finishes),
# also I have to create a method to get the next round, and the current round
# create a model for the tournament and the round
# the round model should have a foreign key to the tournament model, so we can get the rounds of a tournament, and 
# the round model should contain the number of players, and the players, and the status of the round (quarter, semi-final, final), and the winner or winners of the round
 # Create and save a TournamentHistory instance


    # how can i save a tournament
# tournament = TournamentHistory.objects.create(
#     # Set the attributes of the tournament
# )
# tournament.save()

# # Create and save a Round instance
# round = Round.objects.create(
#     tournament=tournament,
#     status='quarter',
#     # Set the other attributes of the round
# )
# round.save()


    # how can i save rounds of a tournament
# # Assuming you have a TournamentHistory instance `tournament`
# # and a list of CustomUser instances `players`

# # Create a quarter-final round
# quarter_final_round = Round.objects.create(
#     tournament=tournament,
#     status='quarter',
# )
# quarter_final_round.players.set(players)
# quarter_final_round.save()

# # Create a semi-final round
# semi_final_round = Round.objects.create(
#     tournament=tournament,
#     status='semi-final',
# )
# semi_final_round.players.set(players)
# semi_final_round.save()

# # Create a final round
# final_round = Round.objects.create(
#     tournament=tournament,
#     status='final',
# )
# final_round.players.set(players)
# final_round.save()


import uuid
from game.models import TournamentHistory
from authentication.models import CustomUser
from asgiref.sync import sync_to_async

class RemoteTournament:
    def __init__(self, organizer_id):# i can use this to create a new tournament
        self.id = uuid.uuid4()
        self.organizer = organizer_id
        self.max_participants = 8
        self.players = []# this is a list of player ids, or we can put them in a table
        self.status = 'pending'

    def add_player(self, player):
        if (self.register_for_tournament(player)):
            self.players.append(player)
            if (len(self.players) == self.max_participants):
                self.start()
            return True
        return False

    def start(self):
        self.status = 'in progress'
        self.save_trounament_to_db()

    def end(self):
        self.status = 'finished'

    def handle_disconnection(self, player):
        self.players.remove(player)

    def handle_reconnection(self, player):
        self.players.append(player)

    def handle_game_over(self, player):
        pass

    def handle_game_start(self, player):
        pass

    def handle_game_end(self, player):
        pass

    def handle_game_timeout(self, player):
        pass

    def get_status(self):
        return self.status
    
    def register_for_tournament(self, player):
        if len(self.players) >= self.max_participants:
            print(f'This tournament has reached its maximum number of participants. {player} cannot be registered.')
            return False
        self.players.append(player)
        print(f'You have been registered for the tournament, {player} .')   
        return True
    
    async def save_trounament_to_db(self):
        #list of players objects
        players = []
        if self.status != 'in progress':
            number_of_players = len(self.players)
        for i in range(number_of_players):
            try:
                player = await sync_to_async(CustomUser.objects.get)(id=self.players[i])
                players.append(player)
            except CustomUser.DoesNotExist:
                print("A player does not exist.")#
        tournament = TournamentHistory(id=self.id, status=self.status, max_players=self.max_participants, organizer=self.organizer)
        tournament.save()
        for player in self.players:
            tournament.players.add(player)
        tournament.save()
        return tournament