from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    has_profile = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "profile_photo",
            "bio",
            "is_approved",
            "has_profile",
            "is_profile_complete",
            "avatar_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_approved",
            "is_profile_complete",
            "created_at",
            "updated_at",
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "bio", "profile_photo"]


class CompleteProfileSerializer(serializers.Serializer):
    user_type = serializers.ChoiceField(choices=User.USER_TYPE_CHOICES)
