"""
Google Calendar service for OAuth and freebusy queries.
Uses the same GOOGLE_CLIENT_ID/SECRET as login, with calendar.readonly scope.
"""
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from urllib.parse import urlencode

from django.conf import settings
from django.utils import timezone
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from office_hours.models import GoogleCalendarToken

logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


class GoogleCalendarService:
    """Service for Google Calendar OAuth and freebusy queries."""

    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET

    def get_auth_url(self, redirect_uri: str) -> str:
        """Generate the Google OAuth URL for calendar access."""
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': ' '.join(SCOPES),
            'access_type': 'offline',
            'prompt': 'consent',  # Force consent to get refresh token
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    def exchange_code(self, code: str, redirect_uri: str) -> dict:
        """Exchange authorization code for tokens."""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            redirect_uri=redirect_uri
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials

        return {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'expires_at': datetime.fromtimestamp(credentials.expiry.timestamp(), tz=timezone.utc),
            'scope': ' '.join(SCOPES),
        }

    def save_tokens(self, user, token_data: dict) -> GoogleCalendarToken:
        """Save or update OAuth tokens for a user."""
        token, created = GoogleCalendarToken.objects.update_or_create(
            user=user,
            defaults={
                'access_token': token_data['access_token'],
                'refresh_token': token_data['refresh_token'],
                'expires_at': token_data['expires_at'],
                'scope': token_data['scope'],
            }
        )
        return token

    def get_credentials(self, user) -> Optional[Credentials]:
        """Get valid credentials for a user, refreshing if needed."""
        try:
            token = user.calendar_token
        except GoogleCalendarToken.DoesNotExist:
            return None

        credentials = Credentials(
            token=token.access_token,
            refresh_token=token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.client_id,
            client_secret=self.client_secret,
            expiry=token.expires_at,
        )

        # Refresh if expired
        if credentials.expired and credentials.refresh_token:
            try:
                credentials.refresh(None)
                # Save refreshed tokens
                token.access_token = credentials.token
                token.expires_at = datetime.fromtimestamp(
                    credentials.expiry.timestamp(), tz=timezone.utc
                )
                token.save()
            except Exception as e:
                logger.error(f"Failed to refresh calendar token for {user.email}: {e}")
                return None

        return credentials

    def get_busy_times(
        self,
        user,
        time_min: datetime,
        time_max: datetime
    ) -> List[Tuple[datetime, datetime]]:
        """
        Get busy time periods from user's calendar.
        Returns list of (start, end) tuples representing busy periods.
        """
        credentials = self.get_credentials(user)
        if not credentials:
            return []

        try:
            service = build('calendar', 'v3', credentials=credentials)

            body = {
                "timeMin": time_min.isoformat(),
                "timeMax": time_max.isoformat(),
                "items": [{"id": "primary"}],
            }

            result = service.freebusy().query(body=body).execute()
            busy_times = []

            for busy in result.get('calendars', {}).get('primary', {}).get('busy', []):
                start = datetime.fromisoformat(busy['start'].replace('Z', '+00:00'))
                end = datetime.fromisoformat(busy['end'].replace('Z', '+00:00'))
                busy_times.append((start, end))

            return busy_times

        except HttpError as e:
            logger.error(f"Calendar API error for {user.email}: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching calendar for {user.email}: {e}")
            return []

    def disconnect(self, user) -> bool:
        """Remove calendar connection for a user."""
        try:
            token = user.calendar_token
            token.delete()
            return True
        except GoogleCalendarToken.DoesNotExist:
            return False


# Singleton instance
google_calendar_service = GoogleCalendarService()
