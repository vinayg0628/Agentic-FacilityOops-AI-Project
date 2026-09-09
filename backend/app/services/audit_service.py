import logging
from app.models.report_models import AuditLog
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger(__name__)

def log_audit(db: Session, user_id: str, role: str, action: str, entity: str, entity_id: str, previous_value: dict = None, new_value: dict = None, ip_address: str = None):
    try:
        audit_log = AuditLog(
            user_id=user_id,
            role=role,
            action=action,
            entity=entity,
            entity_id=entity_id,
            previous_value=previous_value,
            new_value=new_value,
            ip_address=ip_address
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log audit event: {e}")
