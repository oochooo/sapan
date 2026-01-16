from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import ConnectionRequest

User = get_user_model()


class UserConnectionSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "profile_photo",
            "bio",
            "user_type",
            "profile",
            "profile_id",
        ]

    def get_profile(self, obj):
        if obj.user_type == "founder" and hasattr(obj, "founder_profile"):
            return {
                "startup_name": obj.founder_profile.startup_name,
                "stage": obj.founder_profile.stage,
                "industry": (
                    obj.founder_profile.industry.name
                    if obj.founder_profile.industry
                    else None
                ),
            }
        elif obj.user_type == "mentor" and hasattr(obj, "mentor_profile"):
            return {
                "company": obj.mentor_profile.company,
                "role": obj.mentor_profile.role,
                "years_of_experience": obj.mentor_profile.years_of_experience,
            }
        return None

    def get_profile_id(self, obj):
        if obj.user_type == "founder" and hasattr(obj, "founder_profile"):
            return obj.founder_profile.id
        elif obj.user_type == "mentor" and hasattr(obj, "mentor_profile"):
            return obj.mentor_profile.id
        return None


class ConnectionRequestSerializer(serializers.ModelSerializer):
    from_user_detail = UserConnectionSerializer(source="from_user", read_only=True)
    to_user_detail = UserConnectionSerializer(source="to_user", read_only=True)

    class Meta:
        model = ConnectionRequest
        fields = [
            "id",
            "from_user",
            "from_user_detail",
            "to_user",
            "to_user_detail",
            "message",
            "status",
            "created_at",
            "responded_at",
        ]
        read_only_fields = ["id", "from_user", "status", "created_at", "responded_at"]


class ConnectionRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectionRequest
        fields = ["to_user", "message"]

    def validate_to_user(self, value):
        request = self.context["request"]
        if value == request.user:
            raise serializers.ValidationError("You cannot send a request to yourself.")
        if value.user_type != "mentor":
            raise serializers.ValidationError("You can only send requests to mentors.")
        if not value.is_approved:
            raise serializers.ValidationError("This mentor is not yet approved.")
        if ConnectionRequest.objects.filter(
            from_user=request.user, to_user=value
        ).exists():
            raise serializers.ValidationError(
                "You have already sent a request to this mentor."
            )
        return value

    def create(self, validated_data):
        validated_data["from_user"] = self.context["request"].user
        return super().create(validated_data)


class ConnectionSerializer(serializers.ModelSerializer):
    connected_user = serializers.SerializerMethodField()
    connected_at = serializers.DateTimeField(source="responded_at")

    class Meta:
        model = ConnectionRequest
        fields = ["id", "connected_user", "connected_at"]

    def get_connected_user(self, obj):
        request = self.context.get("request")
        if request and request.user == obj.from_user:
            return UserConnectionSerializer(obj.to_user).data
        return UserConnectionSerializer(obj.from_user).data
