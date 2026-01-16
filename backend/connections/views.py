from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

from .models import ConnectionRequest
from .serializers import (
    ConnectionRequestSerializer,
    ConnectionRequestCreateSerializer,
    ConnectionSerializer,
    TownhallConnectionSerializer,
)


class ConnectionListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionSerializer

    def get_queryset(self):
        user = self.request.user
        return ConnectionRequest.objects.filter(
            Q(from_user=user) | Q(to_user=user), status="accepted"
        ).select_related(
            "from_user",
            "to_user",
            "from_user__founder_profile",
            "from_user__mentor_profile",
            "to_user__founder_profile",
            "to_user__mentor_profile",
        )


class SentRequestsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionRequestSerializer

    def get_queryset(self):
        return ConnectionRequest.objects.filter(
            from_user=self.request.user
        ).select_related(
            "from_user",
            "to_user",
            "to_user__founder_profile",
            "to_user__mentor_profile",
        )


class ReceivedRequestsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionRequestSerializer

    def get_queryset(self):
        return ConnectionRequest.objects.filter(
            to_user=self.request.user, status="pending"
        ).select_related(
            "from_user",
            "to_user",
            "from_user__founder_profile",
            "from_user__mentor_profile",
        )


class SendRequestView(generics.CreateAPIView):
    """Any user can send connection requests to any other user."""

    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionRequestCreateSerializer


class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            connection_request = ConnectionRequest.objects.get(
                pk=pk, to_user=request.user, status="pending"
            )
        except ConnectionRequest.DoesNotExist:
            return Response(
                {"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND
            )

        connection_request.status = "accepted"
        connection_request.responded_at = timezone.now()
        connection_request.save()

        return Response(
            ConnectionRequestSerializer(connection_request).data,
            status=status.HTTP_200_OK,
        )


class DeclineRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            connection_request = ConnectionRequest.objects.get(
                pk=pk, to_user=request.user, status="pending"
            )
        except ConnectionRequest.DoesNotExist:
            return Response(
                {"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND
            )

        connection_request.status = "declined"
        connection_request.responded_at = timezone.now()
        connection_request.save()

        return Response(
            ConnectionRequestSerializer(connection_request).data,
            status=status.HTTP_200_OK,
        )


class RecentConnectionsView(generics.ListAPIView):
    """
    Townhall feed: public endpoint showing recent connections.
    - Authenticated users see full names and profiles
    - Anonymous users see anonymized descriptions
    """

    permission_classes = [AllowAny]
    serializer_class = TownhallConnectionSerializer
    pagination_class = None  # Return array directly, not paginated

    def get_queryset(self):
        # Get connections from the last 7 days, max 10
        seven_days_ago = timezone.now() - timedelta(days=7)
        return (
            ConnectionRequest.objects.filter(
                status="accepted", responded_at__gte=seven_days_ago
            )
            .select_related(
                "from_user",
                "to_user",
                "from_user__founder_profile",
                "from_user__founder_profile__industry",
                "from_user__mentor_profile",
                "to_user__founder_profile",
                "to_user__founder_profile__industry",
                "to_user__mentor_profile",
            )
            .order_by("-responded_at")[:10]
        )
