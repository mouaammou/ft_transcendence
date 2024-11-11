from rest_framework.pagination import PageNumberPagination

class TournamentPagination(PageNumberPagination):
    page_size = 21
    max_page_size = 75
    page_size_query_param = 'page_size'
