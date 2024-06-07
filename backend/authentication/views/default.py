from django.http import HttpResponse
from authentication.utils import has_valid_token

@has_valid_token
def default(request):
    h1 = "<h1>Welcome to the default page</h1>"
    return HttpResponse(h1)