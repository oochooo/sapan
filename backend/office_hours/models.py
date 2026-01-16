from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class GoogleCalendarToken(models.Model):
    """Stores mentor's Google Calendar OAuth tokens (separate from login)."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='calendar_token'
    )
    access_token = models.TextField()
    refresh_token = models.TextField()
    expires_at = models.DateTimeField()
    scope = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Google Calendar Token"
        verbose_name_plural = "Google Calendar Tokens"

    def __str__(self):
        return f"Calendar token for {self.user.email}"


class AvailabilityRule(models.Model):
    """Mentor's recurring availability schedule."""
    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='availability_rules'
    )
    weekday = models.IntegerField(
        choices=WEEKDAY_CHOICES,
        validators=[MinValueValidator(0), MaxValueValidator(6)]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.IntegerField(
        default=30,
        validators=[MinValueValidator(15), MaxValueValidator(120)]
    )
    timezone = models.CharField(max_length=50, default="Asia/Bangkok")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Availability Rule"
        verbose_name_plural = "Availability Rules"
        ordering = ['weekday', 'start_time']

    def __str__(self):
        return f"{self.mentor.email} - {self.get_weekday_display()} {self.start_time}-{self.end_time}"


class Booking(models.Model):
    """Booked office hours session between mentor and founder."""
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled_by_founder', 'Cancelled by Founder'),
        ('cancelled_by_mentor', 'Cancelled by Mentor'),
        ('completed', 'Completed'),
    ]

    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mentor_bookings'
    )
    founder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='founder_bookings'
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    agenda = models.TextField(blank=True)
    google_meet_link = models.URLField(blank=True)
    status = models.CharField(
        max_length=25,
        choices=STATUS_CHOICES,
        default='confirmed'
    )
    reminder_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.founder.email} → {self.mentor.email} @ {self.start_time}"

    def save(self, *args, **kwargs):
        # Auto-generate Google Meet link if not set
        if not self.google_meet_link and self.pk:
            self.google_meet_link = self._generate_meet_link()
        super().save(*args, **kwargs)
        # Generate meet link after first save (when we have pk)
        if not self.google_meet_link:
            self.google_meet_link = self._generate_meet_link()
            super().save(update_fields=['google_meet_link'])

    def _generate_meet_link(self):
        """Generate a deterministic Google Meet link from booking ID."""
        import hashlib
        code = hashlib.md5(f"sapan-{self.pk}".encode()).hexdigest()[:10]
        return f"https://meet.google.com/{code[:3]}-{code[3:7]}-{code[7:]}"
