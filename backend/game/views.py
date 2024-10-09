# from rest_framework import viewsets
# from .models import LocalTournament
# from .serializers import LocalTournamentSerializer

# class LocalTournamentViewSet(viewsets.ModelViewSet):
#     queryset = LocalTournament.objects.all()
#     serializer_class = LocalTournamentSerializer

from rest_framework import status, viewsets
from rest_framework.response import Response
from .models import LocalTournament
from .serializers import LocalTournamentSerializer
from django.utils import timezone

# from .local_game.tournament.manager import TournamentManager
import asyncio

class LocalTournamentViewSet(viewsets.ModelViewSet):
    queryset = LocalTournament.objects.all()
    serializer_class = LocalTournamentSerializer

    def create(self, request, *args, **kwargs):
        # request.data['user'] = request.user.username
        print(request.data)
        # request.data['start_at'] = timezone.now() + timezone.timedelta(seconds=10)
        many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=many)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        many = isinstance(request.data, list)
        if many:
            instance = self.get_queryset().filter(pk__in=[item['id'] for item in request.data])
            serializer = self.get_serializer(instance, data=request.data, many=True)
        else:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=False)
        
        serializer.is_valid(raise_exception=True) 
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        many = isinstance(request.data, list)
        if many:
            instance = self.get_queryset().filter(pk__in=[item['id'] for item in request.data])
            serializer = self.get_serializer(instance, data=request.data, many=True, partial=True)
        else:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        many = isinstance(request.data, list)
        if many:
            ids = [item['id'] for item in request.data]
            self.get_queryset().filter(pk__in=ids).delete()
        else:
            instance = self.get_object()
            self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()


