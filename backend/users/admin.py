from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        "email",
        "first_name",
        "last_name",
        "user_type",
        "is_approved",
        "is_active",
        "created_at",
    ]
    list_filter = ["user_type", "is_approved", "is_active", "created_at"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-created_at"]

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Sapan Info",
            {"fields": ("user_type", "profile_photo", "bio", "is_approved")},
        ),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Sapan Info", {"fields": ("email", "first_name", "last_name", "user_type")}),
    )

    actions = ["approve_mentors", "reject_mentors"]

    @admin.action(description="Approve selected mentors")
    def approve_mentors(self, request, queryset):
        updated = queryset.filter(user_type="mentor").update(is_approved=True)
        self.message_user(request, f"{updated} mentor(s) approved.")

    @admin.action(description="Reject selected mentors")
    def reject_mentors(self, request, queryset):
        updated = queryset.filter(user_type="mentor").update(is_approved=False)
        self.message_user(request, f"{updated} mentor(s) rejected.")
