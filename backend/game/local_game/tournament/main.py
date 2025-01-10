# import uuid

# class UniqueKeyResolverAndGenerator:
#     """
#     Resolve user ids to unique keys, And vise versa.
#     """
#     data = {}

#     @classmethod
#     def resolve_or_generate(cls, user_id):
#         unique_key = cls.data.get(user_id)
#         if unique_key is not None:
#             return 



class Tournament:

    def __init__(self) -> None:
        self.nicknames = []

    def set_nickanmes(self, *args):
        self.nicknames.extend(args)
 
class Manager:
    """
    :param key: unique login key of whom created the tournament
    :param value: tournament class instance
    """
    tournaments_group = {}
    tournament_status = {}
    tournment_class :Tournament = Tournament
    tournament_size = 4

    @classmethod
    def start_tournament(cls, unique_key):
        """
        This mean to start or continue, the tournament
        """
        pass

    @classmethod
    def create(cls, unique_key, *nicknames):
        if len(nicknames) != cls.tournament_size:
            raise ValueError("Not enough nicknames")
        if cls._already_has_one(unique_key):
            return False
        tourn = cls.tournment_class()
        tourn.set_nicknames(*nicknames)
        cls.tournaments_group[unique_key] = tourn
        return True
    
    @classmethod
    def get_tournament(cls, unique_key):
        return cls.tournaments_group.get(unique_key)
    

    @classmethod
    def _already_has_one(cls, unique_key):
        return bool(cls.tournaments_group.get(unique_key))
    
