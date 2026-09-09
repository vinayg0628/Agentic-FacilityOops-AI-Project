import logging

logger = logging.getLogger(__name__)

def send_notification(user_id: str, title: str, message: str, type: str = "INFO"):
    """
    Sends an in-app or email notification.
    In production, this would integrate with SMTP or WebSockets.
    """
    logger.info(f"Notification Sent to {user_id}: [{type}] {title} - {message}")
    # Integration logic here
    return True
