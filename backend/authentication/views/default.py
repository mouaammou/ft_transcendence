from django.http import HttpResponse

def default(request):
    h1 = "<h1>Welcome to the default page</h1>"
    return HttpResponse(h1)