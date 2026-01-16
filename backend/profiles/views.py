from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import FounderProfile, MentorProfile
from .serializers import (
    FounderProfileSerializer,
    FounderProfileCreateSerializer,
    MentorProfileSerializer,
    MentorProfileCreateSerializer,
    MentorListSerializer,
    FounderListSerializer,
)


class FounderProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FounderProfileSerializer

    def get_object(self):
        return self.request.user.founder_profile

    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except FounderProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )


class FounderProfileCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FounderProfileCreateSerializer

    def create(self, request, *args, **kwargs):
        if hasattr(request.user, "founder_profile"):
            return Response(
                {"detail": "Profile already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if request.user.user_type != "founder":
            return Response(
                {"detail": "Only founders can create founder profiles."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)


class MentorProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MentorProfileSerializer

    def get_object(self):
        return self.request.user.mentor_profile

    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except MentorProfile.DoesNotExist:
            return Response(
                {"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )


class MentorProfileCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MentorProfileCreateSerializer

    def create(self, request, *args, **kwargs):
        if hasattr(request.user, "mentor_profile"):
            return Response(
                {"detail": "Profile already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if request.user.user_type != "mentor":
            return Response(
                {"detail": "Only mentors can create mentor profiles."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)


class MentorListView(generics.ListAPIView):
    serializer_class = MentorListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = {
        "expertise_industries__slug": ["exact"],
        "can_help_with__slug": ["exact"],
    }
    search_fields = ["user__first_name", "user__last_name", "company", "user__bio"]

    def get_queryset(self):
        return (
            MentorProfile.objects.filter(user__is_approved=True)
            .select_related("user")
            .prefetch_related(
                "expertise_industries",
                "expertise_industries__category",
                "can_help_with",
            )
        )


class MentorDetailView(generics.RetrieveAPIView):
    serializer_class = MentorListSerializer

    def get_queryset(self):
        return (
            MentorProfile.objects.filter(user__is_approved=True)
            .select_related("user")
            .prefetch_related(
                "expertise_industries",
                "expertise_industries__category",
                "can_help_with",
            )
        )


class FounderListView(generics.ListAPIView):
    serializer_class = FounderListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = {
        "industry__slug": ["exact"],
        "stage": ["exact"],
        "objectives__slug": ["exact"],
    }
    search_fields = [
        "user__first_name",
        "user__last_name",
        "startup_name",
        "about_startup",
    ]

    def get_queryset(self):
        return FounderProfile.objects.select_related(
            "user", "industry", "industry__category"
        ).prefetch_related("objectives")


class FounderDetailView(generics.RetrieveAPIView):
    serializer_class = FounderListSerializer

    def get_queryset(self):
        return FounderProfile.objects.select_related(
            "user", "industry", "industry__category"
        ).prefetch_related("objectives")
