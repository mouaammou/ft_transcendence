from django.urls import path
from . import views

urlpatterns = [
    # path('', views.ListUsersView.as_view(), name="chat-friends-list"),
    # path('<int:receiver_id>/', views.ChatHistoryView.as_view(), name = "chat-history"),

    path('chat-friends', views.ListUsersView.as_view(), name="chat-friends-list"),
    path('chat-history/<int:receiver_id>', views.ChatHistoryView.as_view(), name="chat-history-api"),
]

