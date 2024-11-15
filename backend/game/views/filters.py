from rest_framework.viewsets import ModelViewSet
from game.models import LocalTournament
from .serializers.tournament import TournamentSerializer
from .pagination.tournament import TournamentPagination
from rest_framework.permissions import IsAuthenticated

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from game.local_game.eventloop import EventLoopManager


class LocalTournamentViewSet(ModelViewSet):
    # queryset = LocalTournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer
    pagination_class = TournamentPagination
    # lookup_field = 'id'
    # permission_classes = [IsAuthenticated, ]
    

    def perform_create(self, serializer):
        serializer.save(user=self.request.customUser)
    
    def get_queryset(self):
        """
        Filters the queryset based on the filter_keyword from the URL.
        """
        # Get the base queryset
        queryset = LocalTournament.objects.all().order_by('-created_at')
        
        # Get the filter keyword from the URL
        filter_keyword = self.kwargs.get('filter_keyword', None)
        print('#'*30)
        print(filter_keyword)
        print('#'*30)
        
        # Apply filters based on the keyword
        if filter_keyword == 'pending':
            queryset = queryset.filter(match_index=1)  # Adjust to your model field
        elif filter_keyword == 'finished':
            queryset = queryset.filter(finished=True)  # Adjust to your model field
        elif filter_keyword == 'started':
            queryset = queryset.filter(match_index__gt=1)  # Adjust to your model field
        # Add more filters as needed
        return queryset