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

import uuid
from game.models import TournamentHistory, RoundHistroy
from game.remote_game.game_vs_friend import VsFriendGame
from authentication.models import CustomUser
from asgiref.sync import sync_to_async
import asyncio
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from .input_output import RemoteGameInput, RemoteGameOutput

class TournamentManager:
    
    finished_games = []
    
    @classmethod
    def init(cls, event_loop_manager) -> None:
        cls.event_loop_manager = event_loop_manager
        
    @classmethod  
    async def run_tournaments(cls):
        while True:
            try:
                cls.update()
                await cls.clean()
                await asyncio.sleep(1/60)
            except Exception as e:
                print(f"Exception in run_tournaments loop: {e}")
                break
            
    @classmethod
    async def clean(cls):
        for game in list(cls.finished_games):  # Use list to avoid modifying the list while iterating
            try:
                print(f"Cleaning game: {game}")
                await cls._tournament_clean(game)
                cls.event_loop_manager.tournament_games.pop(game, None)
                print(f"Game cleaned: {game}")
            except Exception as e:
                print(f"Exception during cleaning game {game}: {e}")
        cls.finished_games.clear() 
        
    @classmethod  
    def update(cls):
        for game, _ in cls.event_loop_manager.tournament_games.items():
            try:
                frame = game.update()
                if game.is_finished() and not game.saved:
                    print(f"game is finished --->")
                    try:
                        game.saved = True
                        asyncio.create_task(cls.event_loop_manager.save_history(game))
                        print(f"game saved -----> {game.saved}")
                        cls.finished_games.append(game)
                    except Exception as e:
                        print(f"Error saving game history: {e}")
                    print("after save finished game")
                    return   
                cls.event_loop_manager.send_frame_to_player(game.player_1, game, frame)
                cls.event_loop_manager.send_frame_to_player(game.player_2, game, frame)
            except Exception as e:
                print(f"Exception in update method: {e}")
                raise

    @classmethod
    def check_tournament_is_cancelled(cls, tournament):
        players = tournament.round.get_players()
        for player in players:
            if RemoteGameOutput.player_in_board_page(player):
                return False
        tournament.cancel()
        return True
    
    @classmethod
    def players_in_same_game_left_board_page(cls, tournament):
        for game in tournament.games:
            if game and not RemoteGameOutput.player_in_board_page(game.player_1) and not RemoteGameOutput.player_in_board_page(game.player_2):
                game.finished = True
                game.winner = game.player_1
                game.loser = game.player_2

  
    @classmethod
    async def _tournament_clean(cls, game):
        try:
            tournament_ids = list(cls.event_loop_manager.active_tournaments.keys())
            for tournament_id in tournament_ids:
                tournament = cls.event_loop_manager.active_tournaments[tournament_id]
                if tournament is not None and game in tournament.games:
                    cls._update_tournament_players(tournament, game)
                    tournament.finished_games.append(game)
                    
                    is_finished = tournament.round_is_finished(game)
                    if is_finished:
                        cls._clean_finished_games(tournament)
                        cls.event_loop_manager.tournament_games.clear()
                        await asyncio.sleep(15)
                        if not tournament.start_new_round():
                            cls.event_loop_manager.end_tournament(tournament.id)
                            return
                        cls.event_loop_manager.active_tournaments[tournament.id] = tournament
                        cls.event_loop_manager.start_tournament(tournament.round.players[0])
        except Exception as e:
                print(f"Exception in _tournament_clean: {e}")
                raise

    @classmethod
    def _update_tournament_players(cls, tournament, game):
        try:
            
            index_of_game = tournament.games.index(game) 
            game.determine_winner_loser() 
            if tournament.round.status == 'quarter':  
                if index_of_game in range(4):
                    tournament.players[8 + index_of_game] = game.winner
            elif tournament.round.status == 'semi-final':
                if index_of_game in range(2):
                    tournament.players[12 + index_of_game] = game.winner
            elif tournament.round.status == 'final':
                tournament.players[14] = game.winner
                tournament.winner = game.winner
        except Exception as e:
                print(f"Exception in Update_tournament_players: {e}")
                raise

    @classmethod
    def _clean_finished_games(cls, tournament):
        try:
            for game_to_remove in tournament.finished_games:
                if game_to_remove in tournament.games:
                    tournament.games.remove(game_to_remove)
                if game_to_remove.loser is not None:
                    cls.event_loop_manager.active_players.pop(game_to_remove.loser, None)
                    cls.event_loop_manager.players_in_tournaments.pop(game_to_remove.loser, None)
                    # cls.event_loop_manager.tournament_games.pop(game_to_remove, None) 
            tournament.finished_games.clear()
        except Exception as e:
                print(f"Exception in _clean_finished_games: {e}")
                raise

class Round:
    def __init__(self, tournament_id, status, players):
        self.tournament_id = tournament_id
        self.status = status # quarter, semi-final, final
        self.players = players   
        self.winners = []
        self.start = False
        self.end = False

    def get_games(self):
        return self.games
    
    def calculate_len(self, list):
        count = 0
        for i in list:
            if i != -1:
                count += 1
        return count
    
    def set_games(self, games):
        self.games = games

    def update_round_results(self, game):
        print(f'Entering update_round_results with game: {game}')
        print(f'Game finished: {game.is_finished()}, Game winner: {game.winner}, Current winners: {self.winners}')
        
        if game.winner not in self.winners:
            self.winners.append(game.winner)
            print(f'Added winner: {game.winner}, Updated winners list: {self.winners}')
        
        expected_winners_count = self.calculate_len(self.players) // 2
        print(f'Expected winners count: {expected_winners_count}, Current winners count: {len(self.winners)}')
        
        if len(self.winners) != expected_winners_count:
            print(f'In round {self.status}, len of winners {len(self.winners)} and len of players {self.calculate_len(self.players)}')
            return False
        
        self.end = True
        print(f'Round {self.status} ended successfully.')
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
        elif self.status == 'final':
            return 'celebration'
    def get_current_round(self):
        return self.status
    
    def is_finished(self):
        return self.end

    

class Tournament:
    def __init__(self, organizer, name):      
        self.id = str(uuid.uuid4())
        self.name = name  
        self.max_participants =  8 # 8
        #how to say that the tournament players list will have a size of 15
        self.players = [-1] * 15
        self.players[0] =  organizer
        self.status = 'pending' # pending, started, finished, cancelled
        self.fulfilled = False
        self.send_once = False
        self.notified = False
        self.round = None
        self.rounds = {
            'quarter': None,   
            'semi-final': None,
            'final': None 
        }
        self.winner = None
        self.games = []  
        self.finished_games = [] # it is not doing anything because i set the games to games = [] when i start a new round
        self.organizer = organizer   
        self.play = False
        try:
            print('saving tournament')
            asyncio.create_task(self.save_tournament_to_db())  # save the tournament to the database when it is created
            print('tournament saved')
        except Exception as e:
            print(f"Error saving tournament to database: {e}")

    def append_player(self, player):
        for i in range(len(self.players)):
            if self.players[i] == -1:
                self.players[i] = player
                return True
        return False
        

    def register_for_tournament(self, player):
        print(f'player {player} is trying to register for the tournament haha' )
        if self.add_player(player):
            self.append_player(player)
            if self.claculate_len(self.players) == self.max_participants:
                print(f'All players have been registered for the tournament. {player} is the last player to register.')
                print(f'number of players in the tournament {self.claculate_len(self.players)} and the max number of players {self.max_participants}')
                self.start_first_round()
            return True
        return False

    def get_games(self):
        return self.games
    
    def get_players(self):
        return self.players


    def remove_player(self, player):
        index = self.players.index(player)
        if index != -1:
            self.players[index] = -1
            return True
        return False
        
    def start_game(self, player_1, player_2):
        game = VsFriendGame(player_1=player_1, player_2=player_2)
        game.pause()
        game.remote_type = 'tournament'
        self.games.append(game)
        return True

    def create_games(self):
        players_list = list(self.round.players)
        # create games for players that are not -1
        valid_players = [player for player in players_list if player != -1]
        for i in range(0, self.claculate_len(valid_players), 2):
            self.start_game(valid_players[i], valid_players[i+1])

    def start_first_round(self):
        self.fulfilled = True
        self.round = Round(self.id, 'quarter', self.players[:self.max_participants]) # after change the number of players to the max number of players
        print(f'in the start_first_round method {self.round.players}')
        self.rounds['quarter'] = self.round
        self.games = []
        self.create_games()
        print('^_^ ^_^ All games are launched ^__^')
        self.round.games = self.games
        print(f'Tournament saved for the status {self.status}')
        # asyncio.create_task(self.save_tournament_to_db())

    def pause(self):
        self.play = False

    def resume(self):
        self.play = True

    def cancel(self):
        self.status = 'cancelled'
        try:
            asyncio.create_task(self.save_tournament_to_db())
        except Exception as e:
            print(f"Error saving tournament to database: {e}")

    def get_next_round(self):
        return self.round.get_next_round()
    
    def start_new_round(self):
        print("start new round method 64568426284648")
        next_round = self.get_next_round()
        if next_round == 'celebration':
            self.end()
            return False
        players = []
        if next_round == 'semi-final':
            players = self.players[8:12] # suppose to be 8:12
        elif next_round == 'final':
            players = self.players[12:14]
        
        print(f'players of the new round those motherifers --> {players}')
        self.round = Round(self.id, next_round, players)
        print(f'Starting a new round {next_round}')
        print(f'players of the new round {players}')
        print(f'players of the new round {self.round.players}')
        self.rounds[next_round] = self.round
        self.games = []
        self.winners = []
        self.create_games()
        self.round.games = self.games
        # try:
        #     asyncio.create_task(self.save_tournament_to_db())
        # except Exception as e:
        #     print(f"Error saving tournament to database: {e}")
        return True


    def round_is_finished(self, game):
        return self.round.update_round_results(game)

    def end(self):
        self.status = 'finished'
        self.winner = self.players[14]
        try:
            asyncio.create_task(self.save_tournament_to_db())
        except Exception as e:
            print(f"Error saving tournament to database: {e}")

    def handle_disconnection(self, player):
        self.players.remove(player)

    def handle_reconnection(self, player):
        self.append_player(player)

    def get_status(self):
        return self.status
    
    def claculate_len(self, list):
        count = 0
        for i in list:
            if i != -1:
                count += 1
        return count
    
    def add_player(self, player):
        if self.claculate_len(self.players) >= self.max_participants:
            print(f'This tournament has reached its maximum number of participants. {player} cannot be registered.')
            return False
        print(f'You have been registered for the tournament, {player} .')   
        return True
    
   
    
    async def save_tournament_to_db(self):
        #list of players objects
        print(f'tournament created for the satatus {self.status}')
        players = []
        if self.status == 'pending':
            new_organizer = await sync_to_async(CustomUser.objects.get) (id=self.organizer)
            tournament = await sync_to_async(TournamentHistory.objects.create)(id=self.id, name=self.name, status=self.status, max_players=self.max_participants, organizer=new_organizer)
            # how to get the id that is generated by the database
            self.id = str(tournament.id)
            await sync_to_async(tournament.save)()
            return
        elif self.status == 'started':
            try:
                tournament = await sync_to_async(TournamentHistory.objects.get)(id=self.id)
                tournament.status = self.status
                await sync_to_async(tournament.save)()
                players_ids = self.round.get_players()
                players = await sync_to_async(CustomUser.objects.filter)(id__in=players_ids)
                await sync_to_async(tournament.players.set)(players)
                await sync_to_async(tournament.save)()
                round = await sync_to_async(RoundHistroy.objects.create)(tournament=tournament, status=self.round.get_status()) # remember to set the status of the round
                await sync_to_async(round.save)()
                await sync_to_async(round.players.set)(players)
                await sync_to_async(round.save)() 
                return
            except ObjectDoesNotExist:
                # Handle the case where no TournamentHistory object with the given id exists.
                # This could involve creating a new TournamentHistory object, logging an error message, etc.
                print(f"No TournamentHistory object with id {self.id} exists.")
        elif self.status in ['finished', 'cancelled']:
            tournament = await sync_to_async(TournamentHistory.objects.get)(id=self.id)
            tournament.status = self.status
            if self.winner is not None:
                winner = await sync_to_async(CustomUser.objects.get) (id=self.winner)
                tournament.winner = winner
            await sync_to_async(tournament.save)()
            return
        

