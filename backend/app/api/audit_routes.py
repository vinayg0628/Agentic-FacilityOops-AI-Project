from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.report_models import AuditLog
from typing import List, Optional

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/")
def get_audit_logs(user_id: Optional[str] = None, action: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    q = db.query(AuditLog)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if action:
        q = q.filter(AuditLog.action == action)
        
    logs = q.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
