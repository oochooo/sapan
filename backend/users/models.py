from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('founder', 'Founder'),
        ('mentor', 'Mentor'),
    ]

    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, blank=True, default='')
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    is_profile_complete = models.BooleanField(default=False)
    avatar_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def save(self, *args, **kwargs):
        if self.user_type == 'founder':
            self.is_approved = True
        if self.user_type:
            self.is_profile_complete = True
        super().save(*args, **kwargs)

    @property
    def has_profile(self):
        if self.user_type == 'founder':
            return hasattr(self, 'founder_profile')
        elif self.user_type == 'mentor':
            return hasattr(self, 'mentor_profile')
        return False
