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
from game.models import TournamentHistory, RoundHistroy
from game.remote_game.game_vs_friend import VsFriendGame
from authentication.models import CustomUser
from asgiref.sync import sync_to_async
import asyncio
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist


   

class Round:
    def __init__(self, tournament_id, status, players):
        self.tournament_id = tournament_id
        self.status = status # quarter, semi-final, final
        self.players = players
        self.winners = []
        self.games = []
        self.start = False
        self.end = False

    def get_games(self):
        return self.games
    
    def set_games(self, games):
        self.games = games

    def update_round_results(self):
        for game in self.games:
            if game.is_finished() and game.winner not in self.winners:
                self.winners.append(game.winner)
        if len(self.winners) != len(self.players) // 2:
            return False
        self.end = True
        return True

    def get_winners(self):
        return self.winners
    
    def set_winners(self, winners):
        self.winners = winners

    def get_players(self):
        return self.players

    def get_status(self):
        return self.status

    def get_tournament_id(self):
        return self.tournament_id

    def save_round_to_db(self):
        pass

    def get_next_round (self):
        if self.status == 'quarter':
            return 'semi-final'
        elif self.status == 'semi-final':
            return 'final'
        else:
            return None
    def get_current_round(self):
        return self.status
    
    def is_finished(self):
        return self.end

    

class Tournament:
    def __init__(self, organizer):
        self.id = uuid.uuid4()
        self.max_participants = 8
        self.players =  {organizer}
        self.status = 'pending'
        self.round = None
        self.rounds = {
            'quarter': None,
            'semi-final': None,
            'final': None
        }
        self.winner = None
        self.games = []
        self.organizer = organizer 
        self.play = False
        try:
            print('saving tournament')
            # asyncio.create_task(self.save_trounament_to_db())  # save the tournament to the database when it is created
            print('tournament saved')
        except Exception as e:
            print(f"Error saving tournament to database: {e}")


    def register_for_tournament(self, player):
        if self.add_player(player):
            self.players.add(player)
            if len(self.players) == self.max_participants:
                self.start()
            return True
        return False

    def get_games(self):
        return self.games

    def start_game(self, player_1, player_2):
        game = VsFriendGame(player_1=player_1, player_2=player_2)
        game.pause()
        game.remote_type = 'tournament'
        self.games.append(game)
        return True

    def create_games(self):
        players_list = list(self.players)
        for i in range(0, len(players_list), 2):
            self.start_game(players_list[i], players_list[i+1])

    def start(self):
        self.round = Round(self.id, 'quarter', self.players)
        self.rounds['quarter'] = self.round
        self.games = []
        self.create_games()
        print('^_^ ^_^ All games are launched ^__^')
        self.round.games = self.games
        self.status = 'started'
        print(f'Tournament saved for the status {self.status}')
        # asyncio.create_task(self.save_trounament_to_db())

    def pause(self):
        self.play = False

    def resume(self):
        self.play = True

    def cancel(self):
        self.status = 'cancelled'
        try:
            asyncio.create_task(self.save_trounament_to_db())
        except Exception as e:
            print(f"Error saving tournament to database: {e}")

    def get_next_round(self):
        return self.round.get_next_round()
    
    def start_new_round(self):
        next_round = self.get_next_round()
        players = self.round.get_winners()
        self.round = Round(self.id, next_round, players)
        self.games = []
        self.create_games()
        self.round.games = self.games


    def round_is_finished(self):
        return self.round.update_round_results()

    def end(self):
        self.status = 'finished'
        try:
            asyncio.create_task(self.save_trounament_to_db())
        except Exception as e:
            print(f"Error saving tournament to database: {e}")

    def handle_disconnection(self, player):
        self.players.remove(player)

    def handle_reconnection(self, player):
        self.players.add(player)

    def get_status(self):
        return self.status
    
    def add_player(self, player):
        if len(self.players) >= self.max_participants:
            print(f'This tournament has reached its maximum number of participants. {player} cannot be registered.')
            return False
        print(f'You have been registered for the tournament, {player} .')   
        return True
    
    async def save_trounament_to_db(self):
        #list of players objects
        print(f'tournament created for the satatus {self.status}')
        players = []
        if self.status in  ['pending', 'cancelled']:
            new_organizer = await sync_to_async(CustomUser.objects.get) (id=self.organizer)
            tournament = await sync_to_async(TournamentHistory.objects.create)(id=self.id, status=self.status, max_players=self.max_participants, organizer=new_organizer)
            await sync_to_async(tournament.save)()
            return
        elif self.status == 'started':
            try:
                tournament = await sync_to_async(TournamentHistory.objects.get)(id=self.id)
                tournament.status = self.status
                await sync_to_async(tournament.save)()
                players_ids = self.round.get_players()
                players = await sync_to_async(CustomUser.objects.filter)(id__in=players_ids)
                tournament.players.set(players)
                await sync_to_async(tournament.save)()
                round = await sync_to_async(RoundHistroy.objects.create)(tournament=tournament, status=self.round.get_status()) # remember to set the status of the round
                await sync_to_async(round.save)()
                round.players.set(players)
                await sync_to_async(round.save)() 
                return
            except ObjectDoesNotExist:
                # Handle the case where no TournamentHistory object with the given id exists.
                # This could involve creating a new TournamentHistory object, logging an error message, etc.
                print(f"No TournamentHistory object with id {self.id} exists.")
        elif self.status == 'finished':
            tournament = await sync_to_async(TournamentHistory.objects.get)(id=self.id)
            tournament.status = self.status
            tournament.winner = self.winner
            await sync_to_async(tournament.save)()
            return
        

