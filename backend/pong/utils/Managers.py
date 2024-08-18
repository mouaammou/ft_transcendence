
class LocalGameManager:
    """
    Handle one game logic Here.
    """

    game_class = None

    def __init__(self) -> None:
        self.game_obj = self.game_class()
        self.game_mode = 'local'
        self.consumer = None
        self.model_obj = None

    def start(self):
        self.game_obj.start()
    
    def stop(self):
        self.game_obj.pause()
    
    # getters
    def get_consumer(self, consumer):
        return self.consumer

    def get_left(self):
        return self.left_id
    
    def get_right(self):
        return self.right_id
    
    def get_game_obj(self):
        return self.game_obj
    
    def get_game_id(self):
        return self.game_id
    
    # setters

    def set_consumer(self, consumer):
        self.consumer = consumer

    def set_left(self, left_id):
        self.left_id = left_id
    
    def set_right(self, right_id):
        self.right_id = right_id
    
    def set_game_obj(self, game_obj):
        self.game_obj = game_obj
    
    def set_game_id(self, game_id):
        self.game_id = game_id