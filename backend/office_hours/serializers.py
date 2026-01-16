from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import GoogleCalendarToken, AvailabilityRule, Booking

User = get_user_model()


class GoogleCalendarTokenSerializer(serializers.ModelSerializer):
    """Serializer for calendar connection status (no sensitive data exposed)."""
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = GoogleCalendarToken
        fields = ['is_connected', 'expires_at', 'created_at']
        read_only_fields = ['is_connected', 'expires_at', 'created_at']

    def get_is_connected(self, obj):
        return True


class CalendarCallbackSerializer(serializers.Serializer):
    """Serializer for OAuth callback."""
    code = serializers.CharField(required=True)
    redirect_uri = serializers.URLField(required=True)


class AvailabilityRuleSerializer(serializers.ModelSerializer):
    """Serializer for availability rules."""
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)

    class Meta:
        model = AvailabilityRule
        fields = [
            'id', 'weekday', 'weekday_display', 'start_time', 'end_time',
            'slot_duration_minutes', 'timezone', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'weekday_display', 'created_at', 'updated_at']

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })

        return data

    def create(self, validated_data):
        validated_data['mentor'] = self.context['request'].user
        return super().create(validated_data)


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info for booking display."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'profile_photo', 'avatar_url']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings."""
    mentor_info = UserMinimalSerializer(source='mentor', read_only=True)
    founder_info = UserMinimalSerializer(source='founder', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'mentor', 'founder', 'mentor_info', 'founder_info',
            'start_time', 'end_time', 'agenda', 'google_meet_link',
            'status', 'status_display', 'reminder_sent', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'mentor_info', 'founder_info', 'google_meet_link',
            'status_display', 'reminder_sent', 'created_at', 'updated_at'
        ]


class BookingCreateSerializer(serializers.Serializer):
    """Serializer for creating a booking."""
    mentor_id = serializers.IntegerField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    agenda = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_mentor_id(self, value):
        try:
            mentor = User.objects.get(pk=value, user_type='mentor')
        except User.DoesNotExist:
            raise serializers.ValidationError("Mentor not found.")
        return value

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })
        return data


class TimeSlotSerializer(serializers.Serializer):
    """Serializer for available time slots."""
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    is_available = serializers.BooleanField()
