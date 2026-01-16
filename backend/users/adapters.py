import uuid
from allauth.account.models import EmailAddress
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def _ensure_line_email(self, sociallogin):
        """Ensure LINE users have a placeholder email in both user and email_addresses."""
        if sociallogin.account.provider != "line":
            return

        uid = sociallogin.account.uid
        placeholder_email = f"{uid}@line.placeholder"

        # Set on user object
        if not sociallogin.user.email:
            sociallogin.user.email = placeholder_email

        # CRITICAL: allauth v65 checks sociallogin.email_addresses, not user.email
        if not sociallogin.email_addresses:
            sociallogin.email_addresses = [
                EmailAddress(email=placeholder_email, verified=True, primary=True)
            ]

    def is_auto_signup_allowed(self, request, sociallogin):
        """
        Always allow auto signup for social accounts - no separate signup form needed.
        """
        self._ensure_line_email(sociallogin)
        return True

    def pre_social_login(self, request, sociallogin):
        """
        - Ensure LINE users have a placeholder email before signup check
        - If user exists with this email, connect the social account to it.
        """
        self._ensure_line_email(sociallogin)

        if sociallogin.is_existing:
            return

        email = sociallogin.account.extra_data.get("email") or sociallogin.user.email
        if email:
            try:
                user = User.objects.get(email=email)
                sociallogin.connect(request, user)
            except User.DoesNotExist:
                pass

    def populate_user(self, request, sociallogin, data):
        """
        Populate user data from social account.
        """
        user = super().populate_user(request, sociallogin, data)

        extra_data = sociallogin.account.extra_data
        provider = sociallogin.account.provider

        if provider == "google":
            user.first_name = extra_data.get("given_name", "")
            user.last_name = extra_data.get("family_name", "")
            user.avatar_url = extra_data.get("picture", "")
        elif provider == "line":
            display_name = extra_data.get("displayName", "") or extra_data.get(
                "name", ""
            )
            if display_name:
                parts = display_name.split(" ", 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ""
            user.avatar_url = extra_data.get("pictureUrl", "") or extra_data.get(
                "picture", ""
            )

            # LINE may not provide email - generate a placeholder
            if not user.email:
                line_user_id = extra_data.get("userId", "") or sociallogin.account.uid
                user.email = f"{line_user_id}@line.placeholder"

        return user

    def save_user(self, request, sociallogin, form=None):
        """
        Save user with auto-generated username.
        """
        user = sociallogin.user

        # Get email or generate placeholder for LINE users
        email = user.email or sociallogin.account.extra_data.get("email", "")
        if not email:
            uid = sociallogin.account.uid
            email = f"{uid}@{sociallogin.account.provider}.placeholder"
        user.email = email

        # Generate unique username
        base_username = (
            email.split("@")[0] if "@" in email else f"user_{uuid.uuid4().hex[:8]}"
        )
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        user.username = username

        user.set_unusable_password()
        user.save()

        sociallogin.save(request)
        return user
