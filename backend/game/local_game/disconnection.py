"""
game modes:
    - remote
    - local

input events:
    - onPress:
        call: game.on_press('left|right', key)
    - onRelease
        call: game.on_release('left|right', key)

output events:
    - left_paddle_pos
    - right_paddle_pos
    - right_player_score
    - left_player_score
    - ball_pos
    - finished
"""

import asyncio
  

# DONT FORGET: DO NOT UPDATE THE GAME ON DISCONNECTION

class LocalGameDisconnection:
    # PING PONG Game will inherete this

    _timeout_in = 5 # seconds

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._disconnected = False
        self._disconnetion_task = None

        self._outside_callback = None         #function
        self._outside_callback_args = list()  #1,5,6
        self._outside_callback_kwargs = dict() #said=5,sasa=878
    
    ################## public interface #####################
    @property
    def disconnected(self):
        return self._disconnected
    
    @disconnected.setter
    def disconnected(self, value: bool):
        self._disconnected = value
        if value:
            self._add_task()
        else:
            self._cancel_task()
    
    def set_disconnection_timeout_callback(self, callback, *args, **kwargs):
        """
        This is used to set a callback when local game is 
        didn't reconnect in the specified period.
        """
        self._outside_callback = callback
        self._outside_callback_args = args
        self._outside_callback_kwargs = kwargs
    
    ################### end public interface ####################
    
    ################## private interface ######################
    def _cancel_task(self):
        if self._disconnetion_task is None:
            return
        print('************* task is canceled *************')
        self._disconnetion_task.cancel()
        self._disconnetion_task = None
        self._outside_callback = None
        self._outside_callback_args = list()
        self._outside_callback_kwargs = dict()
    
    def _add_task(self):
        if self._disconnetion_task is not None:
            return
        print('************* task is added *************')
        loop = asyncio.get_running_loop()
        future_time = loop.time() + self._timeout_in
        task = loop.call_at(future_time, self._disconnection_timeout)
        self._disconnetion_task = task
    
    def _disconnection_timeout(self):
        if self._outside_callback is None:
            return
        print('************* task is timedout *************')
        
        self._outside_callback(
            *self._outside_callback_args,
            **self._outside_callback_kwargs
        )
        self._outside_callback = None
        self._outside_callback_args = list()
        self._outside_callback_kwargs = dict()