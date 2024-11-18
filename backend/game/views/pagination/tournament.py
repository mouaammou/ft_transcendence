from rest_framework.pagination import PageNumberPagination

class TournamentPagination(PageNumberPagination):
    page_size = 21
    max_page_size = 75
    page_size_query_param = 'page_size'

    def get_page_number(self, request, paginator):
        """
        Customize the logic to determine the page number.
        """
        # print('Page Number'*6)
        page_number = request.query_params.get(self.page_query_param, 1)
        try:
            # Ensure page_number is an integer
            page_number = int(page_number)
        except ValueError:
            page_number = 1  # Default to page 1 if invalid

        # Check if the page number exceeds the total number of pages
        if page_number > paginator.num_pages:
            page_number = paginator.num_pages  # Set to the last page
        if page_number < 1:
            page_number = 1
        
        return page_number