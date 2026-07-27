import logging

logger = logging.getLogger("facilityops.email_utils")

def send_alert_notification_email(recipient: str, subject: str, body: str) -> bool:
    """Mock notification utility for dispatching email and webhook alerts."""
    logger.info(f"Simulating email dispatch to {recipient} | Subject: {subject}")
    return True
