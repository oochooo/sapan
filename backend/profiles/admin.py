from django.contrib import admin
from .models import FounderProfile, MentorProfile


@admin.register(FounderProfile)
class FounderProfileAdmin(admin.ModelAdmin):
    list_display = ["startup_name", "user", "industry", "stage", "created_at"]
    list_filter = ["stage", "industry__category", "created_at"]
    search_fields = [
        "startup_name",
        "user__email",
        "user__first_name",
        "user__last_name",
    ]
    filter_horizontal = ["objectives"]


@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "company", "role", "years_of_experience", "created_at"]
    list_filter = ["years_of_experience", "created_at"]
    search_fields = [
        "company",
        "role",
        "user__email",
        "user__first_name",
        "user__last_name",
    ]
    filter_horizontal = ["expertise_industries", "can_help_with"]
