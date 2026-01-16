from django.contrib import admin
from .models import GoogleCalendarToken, AvailabilityRule, Booking


@admin.register(GoogleCalendarToken)
class GoogleCalendarTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'expires_at', 'created_at', 'updated_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AvailabilityRule)
class AvailabilityRuleAdmin(admin.ModelAdmin):
    list_display = ['mentor', 'weekday', 'start_time', 'end_time', 'slot_duration_minutes', 'is_active']
    list_filter = ['weekday', 'is_active', 'timezone']
    search_fields = ['mentor__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['mentor', 'founder', 'start_time', 'end_time', 'status', 'reminder_sent']
    list_filter = ['status', 'reminder_sent']
    search_fields = ['mentor__email', 'founder__email']
    readonly_fields = ['created_at', 'updated_at', 'google_meet_link']
    date_hierarchy = 'start_time'
