from django.db import models
from django.conf import settings


class ConnectionRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    ]

    INTENT_CHOICES = [
        ("mentor_me", "I'd like mentorship"),
        ("collaborate", "Let's collaborate"),
        ("peer_network", "Peer networking"),
    ]

    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_requests"
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_requests",
    )
    message = models.TextField(null=True, blank=True)
    intent = models.CharField(
        max_length=20, choices=INTENT_CHOICES, default="peer_network"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["from_user", "to_user"]

    def __str__(self):
        return f"{self.from_user.email} → {self.to_user.email} ({self.status})"
