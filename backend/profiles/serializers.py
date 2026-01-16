from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FounderProfile, MentorProfile
from industries.serializers import IndustrySubcategorySerializer, ObjectiveSerializer
from industries.models import IndustrySubcategory, Objective

User = get_user_model()


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "profile_photo", "bio"]


class FounderProfileSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    industry_detail = IndustrySubcategorySerializer(source="industry", read_only=True)
    objectives_detail = ObjectiveSerializer(
        source="objectives", many=True, read_only=True
    )
    stage_display = serializers.CharField(source="get_stage_display", read_only=True)

    class Meta:
        model = FounderProfile
        fields = [
            "id",
            "user",
            "startup_name",
            "industry",
            "industry_detail",
            "stage",
            "stage_display",
            "objectives",
            "objectives_detail",
            "about_startup",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class FounderProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FounderProfile
        fields = ["startup_name", "industry", "stage", "objectives", "about_startup"]

    def create(self, validated_data):
        objectives = validated_data.pop("objectives", [])
        validated_data["user"] = self.context["request"].user
        profile = FounderProfile.objects.create(**validated_data)
        profile.objectives.set(objectives)
        return profile


class MentorProfileSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    expertise_industries_detail = IndustrySubcategorySerializer(
        source="expertise_industries", many=True, read_only=True
    )
    can_help_with_detail = ObjectiveSerializer(
        source="can_help_with", many=True, read_only=True
    )

    class Meta:
        model = MentorProfile
        fields = [
            "id",
            "user",
            "company",
            "role",
            "years_of_experience",
            "expertise_industries",
            "expertise_industries_detail",
            "can_help_with",
            "can_help_with_detail",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class MentorProfileCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorProfile
        fields = [
            "company",
            "role",
            "years_of_experience",
            "expertise_industries",
            "can_help_with",
        ]

    def create(self, validated_data):
        expertise_industries = validated_data.pop("expertise_industries", [])
        can_help_with = validated_data.pop("can_help_with", [])
        validated_data["user"] = self.context["request"].user
        profile = MentorProfile.objects.create(**validated_data)
        profile.expertise_industries.set(expertise_industries)
        profile.can_help_with.set(can_help_with)
        return profile


class MentorListSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    expertise_industries_detail = IndustrySubcategorySerializer(
        source="expertise_industries", many=True, read_only=True
    )
    can_help_with_detail = ObjectiveSerializer(
        source="can_help_with", many=True, read_only=True
    )
    is_connected = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()

    class Meta:
        model = MentorProfile
        fields = [
            "id",
            "user",
            "company",
            "role",
            "years_of_experience",
            "expertise_industries_detail",
            "can_help_with_detail",
            "is_connected",
            "connection_status",
        ]

    def get_is_connected(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        from connections.models import ConnectionRequest

        return ConnectionRequest.objects.filter(
            from_user=request.user, to_user=obj.user, status="accepted"
        ).exists()

    def get_connection_status(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        from connections.models import ConnectionRequest

        connection = ConnectionRequest.objects.filter(
            from_user=request.user, to_user=obj.user
        ).first()
        return connection.status if connection else None


class FounderListSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    industry_detail = IndustrySubcategorySerializer(source="industry", read_only=True)
    objectives_detail = ObjectiveSerializer(
        source="objectives", many=True, read_only=True
    )
    stage_display = serializers.CharField(source="get_stage_display", read_only=True)

    class Meta:
        model = FounderProfile
        fields = [
            "id",
            "user",
            "startup_name",
            "industry_detail",
            "stage",
            "stage_display",
            "objectives_detail",
            "about_startup",
        ]
