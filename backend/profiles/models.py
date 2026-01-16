from django.db import models
from django.conf import settings
from industries.models import IndustrySubcategory, Objective, STAGE_CHOICES


class FounderProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='founder_profile'
    )
    startup_name = models.CharField(max_length=200)
    industry = models.ForeignKey(
        IndustrySubcategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='founders'
    )
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES)
    objectives = models.ManyToManyField(Objective, related_name='founders')
    about_startup = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.startup_name} - {self.user.get_full_name()}"


class MentorProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mentor_profile'
    )
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    years_of_experience = models.IntegerField()
    expertise_industries = models.ManyToManyField(
        IndustrySubcategory,
        related_name='mentors'
    )
    can_help_with = models.ManyToManyField(Objective, related_name='mentors')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role} @ {self.company}"
