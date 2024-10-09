from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from game.local_game.eventloop import EventLoopManager

class PlayTounament(APIView):
    """used to paly next match in a tournament"""
    permission_classes = [IsAuthenticated, ]
    http_method_names = ['get', 'post', ]

    def get(self, request):
        left_nickname = 'Test left Nick'
        right_nickname = 'Test Right Nick'
        print("Unique_key: ", request.unique_key)
        EventLoopManager.add(
            request.unique_key,
            game_type='tournament',
            left_nickname=left_nickname,
            right_nickname=right_nickname,
        )
        print('|'*10)
        EventLoopManager.play(request.unique_key)
        return Response("Hello, world!")
    
    def post(self, request):
        left_nickname = 'Test left Nick'
        right_nickname = 'Test Right Nick'
        EventLoopManager.add(
            request.unique_key,
            game_type='tournament',
            left_nickname=left_nickname,
            right_nickname=right_nickname,
        )
        print('|'*10)
        return Response(f"Hello, world! {request.data}")


class PlayRegular(APIView):
    """used to palyregular game"""
    permission_classes = [IsAuthenticated, ]
    http_method_names = ['get', 'post', ]

    def get(self, request):
        return Response("Hello, world!")
    
    def post(self, request):
        return Response(f"Hello, world! {request.data}")


# curl -X POST http://localhost:8000/game/play/ \
# -H "Host: localhost:3000"
# -H "Content-Type: application/json" \
# -H "Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcyOTA5MzE0MCwiaWF0IjoxNzI4NDg4MzQwLCJqdGkiOiIxNzhmNTY3MjUyMDM0NmMyOTUxMzMxY2QyMzBlYjdmMiIsInVzZXJfaWQiOjEsImNoYW5uZWxfbmFtZSI6IjUyZWM4MTZmLThmMmEtNDZlMi1hOGY1LTc1YTZiMmNlYzI0MSJ9.whHqOaIEn49uYy3uDkUy7Oe_5h3-gn3x2UmXh2rQy6M; access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4NTc0NzQwLCJpYXQiOjE3Mjg0ODgzNDAsImp0aSI6IjQ4YTNmNjI4NjMwMTRiODZiNGYwNTAxYzlhZGM5NDZkIiwidXNlcl9pZCI6MSwiY2hhbm5lbF9uYW1lIjoiNTJlYzgxNmYtOGYyYS00NmUyLWE4ZjUtNzVhNmIyY2VjMjQxIn0.TvrzgxP6ZG_C4Aq_kfGxx9QoA35NjPWYsbq8NrkpZmg; isAuth=true" \
# -d '{"key1":"value1", "key2":"value2"}'
