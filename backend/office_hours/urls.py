from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CalendarAuthURLView,
    CalendarCallbackView,
    CalendarStatusView,
    CalendarDisconnectView,
    AvailabilityViewSet,
    MentorSlotsView,
    BookingViewSet,
)

router = DefaultRouter()
router.register(r'availability', AvailabilityViewSet, basename='availability')
router.register(r'bookings', BookingViewSet, basename='bookings')

urlpatterns = [
    # Calendar OAuth
    path('calendar/auth-url/', CalendarAuthURLView.as_view(), name='calendar-auth-url'),
    path('calendar/callback/', CalendarCallbackView.as_view(), name='calendar-callback'),
    path('calendar/status/', CalendarStatusView.as_view(), name='calendar-status'),
    path('calendar/disconnect/', CalendarDisconnectView.as_view(), name='calendar-disconnect'),

    # Mentor slots
    path('mentors/<int:mentor_id>/slots/', MentorSlotsView.as_view(), name='mentor-slots'),

    # Router URLs
    path('', include(router.urls)),
]
