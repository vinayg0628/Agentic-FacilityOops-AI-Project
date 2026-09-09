from sqlalchemy.orm import Session
from app.models.report_models import AuditLog
import json
from datetime import datetime, timezone

def create_audit_log(db: Session, user_id: str, role: str, action: str, entity: str, entity_id: str, prev_val: dict = None, new_val: dict = None, ip: str = None):
    log = AuditLog(
        user_id=user_id,
        role=role,
        action=action,
        entity=entity,
        entity_id=entity_id,
        previous_value=prev_val,
        new_value=new_val,
        ip_address=ip,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
