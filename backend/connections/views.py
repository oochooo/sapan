from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q

from .models import ConnectionRequest
from .serializers import (
    ConnectionRequestSerializer,
    ConnectionRequestCreateSerializer,
    ConnectionSerializer,
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
    permission_classes = [IsAuthenticated]
    serializer_class = ConnectionRequestCreateSerializer

    def create(self, request, *args, **kwargs):
        if request.user.user_type != "founder":
            return Response(
                {"detail": "Only founders can send connection requests."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)


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
