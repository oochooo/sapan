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
    intent_display = serializers.CharField(source="get_intent_display", read_only=True)

    class Meta:
        model = ConnectionRequest
        fields = [
            "id",
            "from_user",
            "from_user_detail",
            "to_user",
            "to_user_detail",
            "message",
            "intent",
            "intent_display",
            "status",
            "created_at",
            "responded_at",
        ]
        read_only_fields = ["id", "from_user", "status", "created_at", "responded_at"]


class ConnectionRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectionRequest
        fields = ["to_user", "message", "intent"]

    def validate_to_user(self, value):
        request = self.context["request"]
        if value == request.user:
            raise serializers.ValidationError("You cannot send a request to yourself.")
        if not value.is_approved:
            raise serializers.ValidationError("This user is not yet approved.")
        if not value.is_profile_complete:
            raise serializers.ValidationError(
                "This user has not completed their profile."
            )
        # Check for existing request in either direction
        if ConnectionRequest.objects.filter(
            from_user=request.user, to_user=value
        ).exists():
            raise serializers.ValidationError(
                "You have already sent a request to this user."
            )
        if ConnectionRequest.objects.filter(
            from_user=value, to_user=request.user
        ).exists():
            raise serializers.ValidationError(
                "This user has already sent you a request."
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


class TownhallConnectionSerializer(serializers.ModelSerializer):
    """
    Serializer for the townhall feed.
    Returns full details for authenticated users, anonymized for guests.
    """

    from_user_detail = serializers.SerializerMethodField()
    to_user_detail = serializers.SerializerMethodField()
    connected_at = serializers.DateTimeField(source="responded_at")

    class Meta:
        model = ConnectionRequest
        fields = ["id", "from_user_detail", "to_user_detail", "connected_at"]

    def _get_anonymous_profile(self, user):
        """Return anonymized profile info for non-authenticated users."""
        if user.user_type == "founder" and hasattr(user, "founder_profile"):
            profile = user.founder_profile
            industry = profile.industry.name if profile.industry else "tech"
            return {
                "type": "founder",
                "description": f"A {industry.lower()} founder",
            }
        elif user.user_type == "mentor" and hasattr(user, "mentor_profile"):
            profile = user.mentor_profile
            years = profile.years_of_experience or 0
            exp_text = f"{years}+ years experience" if years > 0 else "experienced"
            return {
                "type": "mentor",
                "description": f"A mentor with {exp_text}",
            }
        return {"type": user.user_type, "description": f"A {user.user_type}"}

    def _get_full_profile(self, user):
        """Return full profile info for authenticated users."""
        base = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "user_type": user.user_type,
        }
        if user.user_type == "founder" and hasattr(user, "founder_profile"):
            profile = user.founder_profile
            base["startup_name"] = profile.startup_name
            base["industry"] = profile.industry.name if profile.industry else None
            base["profile_id"] = profile.id
        elif user.user_type == "mentor" and hasattr(user, "mentor_profile"):
            profile = user.mentor_profile
            base["company"] = profile.company
            base["role"] = profile.role
            base["profile_id"] = profile.id
        return base

    def get_from_user_detail(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return self._get_full_profile(obj.from_user)
        return self._get_anonymous_profile(obj.from_user)

    def get_to_user_detail(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return self._get_full_profile(obj.to_user)
        return self._get_anonymous_profile(obj.to_user)
