from django.urls import path
from .views import (
    ConnectionListView, SentRequestsView, ReceivedRequestsView,
    SendRequestView, AcceptRequestView, DeclineRequestView
)

urlpatterns = [
    path('connections/', ConnectionListView.as_view(), name='connection-list'),
    path('connections/requests/sent/', SentRequestsView.as_view(), name='sent-requests'),
    path('connections/requests/received/', ReceivedRequestsView.as_view(), name='received-requests'),
    path('connections/request/', SendRequestView.as_view(), name='send-request'),
    path('connections/request/<int:pk>/accept/', AcceptRequestView.as_view(), name='accept-request'),
    path('connections/request/<int:pk>/decline/', DeclineRequestView.as_view(), name='decline-request'),
]
