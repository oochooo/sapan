from django.urls import path
from .views import (
    GoogleLoginView,
    LineLoginView,
    CompleteProfileView,
    RefreshTokenView,
    LogoutView,
    MeView,
    DevLoginView,
)

urlpatterns = [
    path("google/", GoogleLoginView.as_view(), name="google_login"),
    path("line/", LineLoginView.as_view(), name="line_login"),
    path("complete-profile/", CompleteProfileView.as_view(), name="complete_profile"),
    path("refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("dev-login/", DevLoginView.as_view(), name="dev_login"),
]
