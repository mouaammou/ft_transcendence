from django.urls import path
from . import views

urlpatterns = [
	path("signup/",views.SignUp, name="singup"),
	path("login/",views.Login, name="login"),
	path("",views.default, name="default"),
]
