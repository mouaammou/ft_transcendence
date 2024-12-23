from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from game.local_game.eventloop import EventLoopManager


from django.shortcuts import get_object_or_404

from game.models import LocalTournament

class PlayTounament(APIView):
    """used to paly next match in a tournament"""
    # permission_classes = [IsAuthenticated, ]
    http_method_names = ['get', 'post', ]

    def get(self, request, tid):

        inst = get_object_or_404(LocalTournament, id=tid)
        if inst.finished:
            return Response("Tournament is finished")
        EventLoopManager.add(
            request.unique_key,
            tourn_obj=inst
        )
        EventLoopManager.play(request.unique_key)
        return Response("Tournamnet started")
    
    # def post(self, request):
    #     inst = get_object_or_404(LocalTournament, id=126)
    #     if inst.finished:
    #         return Response("Tournament is finished")
    #     EventLoopManager.add(
    #         request.unique_key,
    #         tourn_obj=inst
    #     )
    #     EventLoopManager.play(request.unique_key)
    #     return Response(f"Hello, world! {request.data}")


class PlayRegular(APIView):
    """used to palyregular game"""
    # permission_classes = [IsAuthenticated, ]
    http_method_names = ['get', 'post', ]

    def get(self, request):
        print(f"\n -------- PlayRegular: {request.unique_key}")
        EventLoopManager.add(
            request.unique_key,
        )
        EventLoopManager.play(request.unique_key)
        return Response("Hello, world!")
    
    def post(self, request):
        EventLoopManager.add(
            request.unique_key,
        )
        EventLoopManager.play(request.unique_key)
        return Response(f"Hello, world! {request.data}")


