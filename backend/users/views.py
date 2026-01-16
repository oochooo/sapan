from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import get_user_model
from django.conf import settings
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.line.views import LineOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from .serializers import UserSerializer, UserUpdateSerializer, CompleteProfileSerializer

User = get_user_model()


class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = (
        settings.SOCIALACCOUNT_PROVIDERS["google"]
        .get("APP", {})
        .get("callback_url", "http://localhost:3000/auth/callback/google")
    )
    client_class = OAuth2Client

    def get_response(self):
        response = super().get_response()
        user = self.user
        refresh = RefreshToken.for_user(user)
        response.data = {
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        }
        return response


class LineLoginView(SocialLoginView):
    adapter_class = LineOAuth2Adapter
    callback_url = (
        settings.SOCIALACCOUNT_PROVIDERS["line"]
        .get("APP", {})
        .get("callback_url", "http://localhost:3000/auth/callback/line")
    )
    client_class = OAuth2Client

    def get_response(self):
        response = super().get_response()
        user = self.user
        refresh = RefreshToken.for_user(user)
        response.data = {
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        }
        return response


class CompleteProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CompleteProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.user_type = serializer.validated_data["user_type"]
        user.save()

        return Response(
            {
                "user": UserSerializer(user).data,
                "message": "Profile completed successfully.",
            },
            status=status.HTTP_200_OK,
        )


class RefreshTokenView(TokenRefreshView):
    permission_classes = [AllowAny]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Successfully logged out."}, status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST
            )


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserSerializer


class DevLoginView(APIView):
    """
    Development-only login endpoint for testing with mock users.
    Only available when DEBUG=True.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.DEBUG:
            return Response(
                {"error": "This endpoint is only available in development mode."},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.check_password(password):
            return Response(
                {"error": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        })
