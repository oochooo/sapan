from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

User = get_user_model()


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        If user exists with this email, connect the social account to it.
        """
        if sociallogin.is_existing:
            return

        email = sociallogin.account.extra_data.get('email')
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

        if provider == 'google':
            user.first_name = extra_data.get('given_name', '')
            user.last_name = extra_data.get('family_name', '')
            user.avatar_url = extra_data.get('picture', '')
        elif provider == 'line':
            display_name = extra_data.get('name', '')
            if display_name:
                parts = display_name.split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
            user.avatar_url = extra_data.get('picture', '')

        return user

    def save_user(self, request, sociallogin, form=None):
        """
        Save user with auto-generated username.
        """
        user = sociallogin.user

        email = user.email or sociallogin.account.extra_data.get('email', '')
        user.email = email

        base_username = email.split('@')[0] if email else 'user'
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
