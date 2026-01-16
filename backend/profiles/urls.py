from django.urls import path
from .views import (
    FounderProfileView, FounderProfileCreateView,
    MentorProfileView, MentorProfileCreateView,
    MentorListView, MentorDetailView,
    FounderListView, FounderDetailView
)

urlpatterns = [
    path('founder/', FounderProfileView.as_view(), name='founder-profile'),
    path('founder/create/', FounderProfileCreateView.as_view(), name='founder-profile-create'),
    path('mentor/', MentorProfileView.as_view(), name='mentor-profile'),
    path('mentor/create/', MentorProfileCreateView.as_view(), name='mentor-profile-create'),
    path('mentors/', MentorListView.as_view(), name='mentor-list'),
    path('mentors/<int:pk>/', MentorDetailView.as_view(), name='mentor-detail'),
    path('founders/', FounderListView.as_view(), name='founder-list'),
    path('founders/<int:pk>/', FounderDetailView.as_view(), name='founder-detail'),
]
