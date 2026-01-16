from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import GoogleCalendarToken, AvailabilityRule, Booking
from .serializers import (
    GoogleCalendarTokenSerializer,
    CalendarCallbackSerializer,
    AvailabilityRuleSerializer,
    BookingSerializer,
    BookingCreateSerializer,
    TimeSlotSerializer,
)
from .services.google_calendar import google_calendar_service
from .services.email_service import send_booking_confirmation, send_booking_cancellation

User = get_user_model()


# ============ Calendar OAuth Views ============

class CalendarAuthURLView(APIView):
    """Get Google OAuth URL for calendar access."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        redirect_uri = request.query_params.get('redirect_uri')
        if not redirect_uri:
            return Response(
                {'error': 'redirect_uri is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        auth_url = google_calendar_service.get_auth_url(redirect_uri)
        return Response({'auth_url': auth_url})


class CalendarCallbackView(APIView):
    """Exchange OAuth code for tokens."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CalendarCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token_data = google_calendar_service.exchange_code(
                code=serializer.validated_data['code'],
                redirect_uri=serializer.validated_data['redirect_uri']
            )
            google_calendar_service.save_tokens(request.user, token_data)

            return Response({
                'message': 'Calendar connected successfully',
                'expires_at': token_data['expires_at']
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to connect calendar: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CalendarStatusView(APIView):
    """Check calendar connection status."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            token = request.user.calendar_token
            return Response({
                'is_connected': True,
                'expires_at': token.expires_at,
                'created_at': token.created_at
            })
        except GoogleCalendarToken.DoesNotExist:
            return Response({'is_connected': False})


class CalendarDisconnectView(APIView):
    """Disconnect calendar."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        success = google_calendar_service.disconnect(request.user)
        if success:
            return Response({'message': 'Calendar disconnected successfully'})
        return Response(
            {'error': 'No calendar connection found'},
            status=status.HTTP_404_NOT_FOUND
        )


# ============ Availability Views ============

class AvailabilityViewSet(viewsets.ModelViewSet):
    """CRUD for availability rules."""
    serializer_class = AvailabilityRuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AvailabilityRule.objects.filter(mentor=self.request.user)


# ============ Slot Generation Views ============

class MentorSlotsView(APIView):
    """Get available time slots for a mentor."""
    permission_classes = [IsAuthenticated]

    def get(self, request, mentor_id):
        # Get mentor
        try:
            mentor = User.objects.get(pk=mentor_id, user_type='mentor')
        except User.DoesNotExist:
            return Response(
                {'error': 'Mentor not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get date range from query params (default: next 14 days)
        date_str = request.query_params.get('date')
        days = int(request.query_params.get('days', 14))

        if date_str:
            try:
                start_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            start_date = timezone.now().date()

        end_date = start_date + timedelta(days=days)

        # Get mentor's availability rules
        rules = AvailabilityRule.objects.filter(
            mentor=mentor,
            is_active=True
        )

        if not rules.exists():
            return Response({'slots': [], 'message': 'Mentor has no availability set'})

        # Generate all possible slots
        slots = []
        current_date = start_date

        while current_date <= end_date:
            weekday = current_date.weekday()

            for rule in rules.filter(weekday=weekday):
                tz = ZoneInfo(rule.timezone)
                slot_start = datetime.combine(current_date, rule.start_time, tzinfo=tz)
                slot_end_time = datetime.combine(current_date, rule.end_time, tzinfo=tz)

                while slot_start + timedelta(minutes=rule.slot_duration_minutes) <= slot_end_time:
                    slot_end = slot_start + timedelta(minutes=rule.slot_duration_minutes)

                    # Only include future slots
                    if slot_start > timezone.now():
                        slots.append({
                            'start_time': slot_start,
                            'end_time': slot_end,
                            'is_available': True
                        })

                    slot_start = slot_end

            current_date += timedelta(days=1)

        # Check for existing bookings
        existing_bookings = Booking.objects.filter(
            mentor=mentor,
            status='confirmed',
            start_time__gte=timezone.now(),
            start_time__date__lte=end_date
        )

        booked_times = set()
        for booking in existing_bookings:
            booked_times.add(booking.start_time.isoformat())

        # Check Google Calendar conflicts
        busy_times = []
        try:
            busy_times = google_calendar_service.get_busy_times(
                mentor,
                timezone.now(),
                datetime.combine(end_date, datetime.max.time(), tzinfo=ZoneInfo('UTC'))
            )
        except Exception:
            pass  # Calendar not connected or error - continue without

        # Mark unavailable slots
        for slot in slots:
            # Check if already booked
            if slot['start_time'].isoformat() in booked_times:
                slot['is_available'] = False
                continue

            # Check Google Calendar conflicts
            for busy_start, busy_end in busy_times:
                if slot['start_time'] < busy_end and slot['end_time'] > busy_start:
                    slot['is_available'] = False
                    break

        # Return serialized slots
        serializer = TimeSlotSerializer(slots, many=True)
        return Response({'slots': serializer.data})


# ============ Booking Views ============

class BookingViewSet(viewsets.ModelViewSet):
    """Booking management."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(
            Q(mentor=user) | Q(founder=user)
        ).select_related('mentor', 'founder')

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        mentor_id = serializer.validated_data['mentor_id']
        start_time = serializer.validated_data['start_time']
        end_time = serializer.validated_data['end_time']
        agenda = serializer.validated_data.get('agenda', '')

        # Get mentor
        mentor = User.objects.get(pk=mentor_id)

        # Check if slot is still available
        existing = Booking.objects.filter(
            mentor=mentor,
            status='confirmed',
            start_time=start_time
        ).exists()

        if existing:
            return Response(
                {'error': 'This slot is no longer available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create booking
        booking = Booking.objects.create(
            mentor=mentor,
            founder=request.user,
            start_time=start_time,
            end_time=end_time,
            agenda=agenda
        )

        # Send confirmation emails
        send_booking_confirmation(booking)

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()

        # Check if user can cancel
        if request.user == booking.founder:
            booking.status = 'cancelled_by_founder'
            cancelled_by = 'founder'
        elif request.user == booking.mentor:
            booking.status = 'cancelled_by_mentor'
            cancelled_by = 'mentor'
        else:
            return Response(
                {'error': 'You cannot cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )

        booking.save()

        # Send cancellation emails
        send_booking_cancellation(booking, cancelled_by)

        return Response(BookingSerializer(booking).data)
