"""
Email service for office hours notifications.
Uses AWS SES (mocked for now - actual implementation to be built later).
"""
import logging
from datetime import datetime
from typing import Optional
from icalendar import Calendar, Event
from django.conf import settings

from office_hours.models import Booking

logger = logging.getLogger(__name__)


def generate_ics_content(booking: Booking) -> str:
    """Generate .ics file content for a booking."""
    cal = Calendar()
    cal.add('prodid', '-//Sapan//Office Hours//EN')
    cal.add('version', '2.0')
    cal.add('method', 'REQUEST')

    event = Event()
    event.add('summary', f'Office Hours: {booking.founder.first_name} & {booking.mentor.first_name}')
    event.add('dtstart', booking.start_time)
    event.add('dtend', booking.end_time)
    event.add('description', f"""
Office Hours Session

Founder: {booking.founder.first_name} {booking.founder.last_name} ({booking.founder.email})
Mentor: {booking.mentor.first_name} {booking.mentor.last_name} ({booking.mentor.email})

Agenda:
{booking.agenda or 'No agenda specified'}

Google Meet Link:
{booking.google_meet_link}

---
Booked via Sapan
""".strip())
    event.add('location', booking.google_meet_link)
    event.add('uid', f'sapan-booking-{booking.pk}@sapan.io')

    cal.add_component(event)
    return cal.to_ical().decode('utf-8')


def send_email_via_ses(
    to_email: str,
    subject: str,
    html_body: str,
    text_body: Optional[str] = None,
    attachment_content: Optional[str] = None,
    attachment_filename: Optional[str] = None
) -> dict:
    """
    Send an email via AWS SES.

    MOCKED FOR NOW - Returns a mock response.
    TODO: Implement actual SES integration later.

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_body: HTML content of the email
        text_body: Plain text content (optional)
        attachment_content: Content of attachment (optional)
        attachment_filename: Filename for attachment (optional)

    Returns:
        dict with 'success' boolean and 'message_id' or 'error'
    """
    # Log the email that would be sent
    logger.info(f"[MOCK SES] Sending email to: {to_email}")
    logger.info(f"[MOCK SES] Subject: {subject}")
    logger.info(f"[MOCK SES] Has attachment: {attachment_content is not None}")

    # TODO: Replace with actual SES implementation
    # import boto3
    # client = boto3.client('ses', region_name='ap-southeast-1')
    # response = client.send_raw_email(...)

    # Mock response
    mock_message_id = f"mock-{datetime.now().strftime('%Y%m%d%H%M%S')}-{to_email.replace('@', '-at-')}"

    return {
        'success': True,
        'message_id': mock_message_id,
        'mocked': True  # Flag to indicate this is a mock response
    }


def send_booking_confirmation(booking: Booking) -> dict:
    """Send booking confirmation emails to both mentor and founder."""
    ics_content = generate_ics_content(booking)

    # Format times for display
    start_formatted = booking.start_time.strftime('%A, %B %d, %Y at %I:%M %p')
    end_formatted = booking.end_time.strftime('%I:%M %p')

    # Email to founder
    founder_subject = f"Office Hours Confirmed with {booking.mentor.first_name}"
    founder_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Office Hours Session is Confirmed!</h2>

        <p>Hi {booking.founder.first_name},</p>

        <p>Your office hours session with <strong>{booking.mentor.first_name} {booking.mentor.last_name}</strong> has been confirmed.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>When:</strong> {start_formatted} - {end_formatted}</p>
            <p style="margin: 5px 0;"><strong>Where:</strong> <a href="{booking.google_meet_link}">Google Meet</a></p>
            <p style="margin: 5px 0;"><strong>Agenda:</strong> {booking.agenda or 'Not specified'}</p>
        </div>

        <p>
            <a href="{booking.google_meet_link}"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Join Google Meet
            </a>
        </p>

        <p style="color: #6b7280; font-size: 14px;">
            We've attached a calendar invite (.ics file) that you can add to your calendar.
        </p>

        <p>Best regards,<br>The Sapan Team</p>
    </body>
    </html>
    """

    founder_result = send_email_via_ses(
        to_email=booking.founder.email,
        subject=founder_subject,
        html_body=founder_html,
        attachment_content=ics_content,
        attachment_filename=f"office-hours-{booking.pk}.ics"
    )

    # Email to mentor
    mentor_subject = f"Office Hours Booked: {booking.founder.first_name}"
    mentor_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Office Hours Booking</h2>

        <p>Hi {booking.mentor.first_name},</p>

        <p><strong>{booking.founder.first_name} {booking.founder.last_name}</strong> has booked an office hours session with you.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>When:</strong> {start_formatted} - {end_formatted}</p>
            <p style="margin: 5px 0;"><strong>Where:</strong> <a href="{booking.google_meet_link}">Google Meet</a></p>
            <p style="margin: 5px 0;"><strong>Agenda:</strong> {booking.agenda or 'Not specified'}</p>
        </div>

        <p>
            <a href="{booking.google_meet_link}"
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Join Google Meet
            </a>
        </p>

        <p style="color: #6b7280; font-size: 14px;">
            We've attached a calendar invite (.ics file) that you can add to your calendar.
        </p>

        <p>Best regards,<br>The Sapan Team</p>
    </body>
    </html>
    """

    mentor_result = send_email_via_ses(
        to_email=booking.mentor.email,
        subject=mentor_subject,
        html_body=mentor_html,
        attachment_content=ics_content,
        attachment_filename=f"office-hours-{booking.pk}.ics"
    )

    return {
        'founder_email': founder_result,
        'mentor_email': mentor_result
    }


def send_booking_cancellation(booking: Booking, cancelled_by: str) -> dict:
    """Send cancellation notification to both parties."""
    start_formatted = booking.start_time.strftime('%A, %B %d, %Y at %I:%M %p')

    # Determine who cancelled
    if cancelled_by == 'founder':
        canceller_name = f"{booking.founder.first_name} {booking.founder.last_name}"
    else:
        canceller_name = f"{booking.mentor.first_name} {booking.mentor.last_name}"

    # Email to founder
    founder_result = send_email_via_ses(
        to_email=booking.founder.email,
        subject=f"Office Hours Cancelled - {start_formatted}",
        html_body=f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Office Hours Session Cancelled</h2>

            <p>Hi {booking.founder.first_name},</p>

            <p>The office hours session scheduled for <strong>{start_formatted}</strong> has been cancelled by {canceller_name}.</p>

            <p>If you'd like to reschedule, you can book a new session through Sapan.</p>

            <p>Best regards,<br>The Sapan Team</p>
        </body>
        </html>
        """
    )

    # Email to mentor
    mentor_result = send_email_via_ses(
        to_email=booking.mentor.email,
        subject=f"Office Hours Cancelled - {start_formatted}",
        html_body=f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Office Hours Session Cancelled</h2>

            <p>Hi {booking.mentor.first_name},</p>

            <p>The office hours session scheduled for <strong>{start_formatted}</strong> has been cancelled by {canceller_name}.</p>

            <p>Best regards,<br>The Sapan Team</p>
        </body>
        </html>
        """
    )

    return {
        'founder_email': founder_result,
        'mentor_email': mentor_result
    }


def send_booking_reminder(booking: Booking) -> dict:
    """Send 24-hour reminder to both parties."""
    start_formatted = booking.start_time.strftime('%A, %B %d, %Y at %I:%M %p')

    # Email to founder
    founder_result = send_email_via_ses(
        to_email=booking.founder.email,
        subject=f"Reminder: Office Hours Tomorrow with {booking.mentor.first_name}",
        html_body=f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Reminder: Office Hours Tomorrow</h2>

            <p>Hi {booking.founder.first_name},</p>

            <p>This is a reminder that you have an office hours session with <strong>{booking.mentor.first_name}</strong> tomorrow.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>When:</strong> {start_formatted}</p>
                <p style="margin: 5px 0;"><strong>Where:</strong> <a href="{booking.google_meet_link}">Google Meet</a></p>
            </div>

            <p>
                <a href="{booking.google_meet_link}"
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Join Google Meet
                </a>
            </p>

            <p>Best regards,<br>The Sapan Team</p>
        </body>
        </html>
        """
    )

    # Email to mentor
    mentor_result = send_email_via_ses(
        to_email=booking.mentor.email,
        subject=f"Reminder: Office Hours Tomorrow with {booking.founder.first_name}",
        html_body=f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Reminder: Office Hours Tomorrow</h2>

            <p>Hi {booking.mentor.first_name},</p>

            <p>This is a reminder that you have an office hours session with <strong>{booking.founder.first_name}</strong> tomorrow.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>When:</strong> {start_formatted}</p>
                <p style="margin: 5px 0;"><strong>Where:</strong> <a href="{booking.google_meet_link}">Google Meet</a></p>
            </div>

            <p>
                <a href="{booking.google_meet_link}"
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Join Google Meet
                </a>
            </p>

            <p>Best regards,<br>The Sapan Team</p>
        </body>
        </html>
        """
    )

    return {
        'founder_email': founder_result,
        'mentor_email': mentor_result
    }
