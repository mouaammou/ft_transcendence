from rest_framework.viewsets import ModelViewSet
from game.models import LocalTournament
from .serializers.tournament import TournamentSerializer
from .pagination.tournament import TournamentPagination
from rest_framework.permissions import IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from game.local_game.eventloop import EventLoopManager

from django.db.models import Q


class SearchLocalTournament(ModelViewSet):
    serializer_class = TournamentSerializer
    pagination_class = TournamentPagination
    
    def get_queryset(self):
        query = self.request.GET.get('search', '')
        if not query:
            return LocalTournament.objects.none()
        return LocalTournament.objects.filter(title__icontains=query)


class LocalTournamentViewSet(ModelViewSet):
    # queryset = LocalTournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer
    pagination_class = TournamentPagination
    # lookup_field = 'id'
    # permission_classes = [IsAuthenticated, ]
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.customUser)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            errors = serializer.errors
            error_messages = []
            for field, messages in errors.items():
                if isinstance(messages, list):
                    error_messages.extend([message for message in messages])
                else:
                    error_messages.append(messages)
            data = {'msg': '\n'.join(error_messages)}
            return Response(data, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        """
        Filters the queryset based on the filter_keyword from the URL.
        """
        # Get the base queryset
        queryset = LocalTournament.objects.all().order_by('-created_at')
        
        # Get the filter keyword from the URL
        filter_keyword = self.kwargs.get('filter_keyword', None)
        filter_keyword = filter_keyword.lower() if filter_keyword else None
        
        # Apply filters based on the keyword
        if filter_keyword == 'pending':
            queryset = queryset.filter(match_index=1)  # Adjust to your model field
        elif filter_keyword == 'finished':
            queryset = queryset.filter(finished=True)  # Adjust to your model field
        elif filter_keyword == 'started':
            queryset = queryset.filter(match_index__gt=1, finished=False)  # Adjust to your model field
        elif filter_keyword == 'oldest-to-newest':
            queryset = queryset.order_by('created_at')
        elif filter_keyword == 'newest-to-oldest':
            queryset = queryset.order_by('-created_at')
        elif filter_keyword == 'recently-played':
            queryset = queryset.order_by('-updated_at').filter(finished=False, match_index__gt=1)
        
        # Add more filters as needed
        return queryset



class TournamentNextMatchPlayersView(APIView):
    def get(self, request, id):
        try:
            tournament = LocalTournament.objects.get(id=id)
            players = tournament.get_match_players(tournament.match_index)
            # EventLoopManager.add(
            #     request.unique_key,
            #     tourn_obj=tournament
            # )
            # EventLoopManager.play(request.unique_key)
            if tournament.finished:
                return Response({"left": 'None', "right": 'None', 'title': tournament.title, 'finished': tournament.finished}, status=status.HTTP_200_OK)
            return Response({
                    "left": players[0],
                    "right": players[1],
                    'title': tournament.title,
                    'finished': tournament.finished,
                    'match_index': tournament.match_index
                },
                status=status.HTTP_200_OK)

        except LocalTournament.DoesNotExist:
            return Response({"error": "Tournament not found."}, status=status.HTTP_404_NOT_FOUND)
    # def post(self, request, id):
    #     try:
    #         EventLoopManager.add(
    #             request.unique_key,
    #             tourn_obj=LocalTournament.objects.get(id=id)
    #         )
    #         EventLoopManager.play(request.unique_key)
    #         return Response({"success": "Match Started."}, status=status.HTTP_200_OK)
    #     except LocalTournament.DoesNotExist:
    #         pass
    #     return Response({"fail": "Tournament Does Not Exist."}, status=status.HTTP_200_OK)




# class SearchLocalTournament(ModelViewSet):
#     serializer_class = TournamentSerializer
#     pagination_class = TournamentPagination
    
#     def get_queryset(self):
#         """
#         Filters the queryset based on the filter_keyword from the URL.
#         """
#         query = self.request.GET.get('search', '')
#         print('#q'*30)
#         print(query)
#         print('#q'*30)

#         if not query:
#             return LocalTournament.objects.none()

#         return LocalTournament.objects.filter(title__icontains=query)