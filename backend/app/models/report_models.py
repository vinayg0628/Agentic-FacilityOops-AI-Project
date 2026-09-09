from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime, timezone
import uuid
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(String(50), primary_key=True, default=generate_uuid)
    user_id = Column(String(50))
    role = Column(String(50))
    action = Column(String(100), nullable=False)
    entity = Column(String(100))
    entity_id = Column(String(50))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    previous_value = Column(JSON)
    new_value = Column(JSON)
    ip_address = Column(String(50))

class ScheduledReport(Base):
    __tablename__ = "scheduled_reports"

    schedule_id = Column(String(50), primary_key=True, default=generate_uuid)
    report_type = Column(String(100), nullable=False) # e.g., "DAILY_FACILITY", "MONTHLY_EXECUTIVE"
    frequency = Column(String(50), nullable=False) # DAILY, WEEKLY, MONTHLY, QUARTERLY
    recipients = Column(String(500)) # comma separated emails
    last_run = Column(DateTime)
    next_run = Column(DateTime)
    status = Column(String(50), default="ACTIVE")

class FacilityReport(Base):
    __tablename__ = "facility_reports"

    report_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), nullable=False)
    report_type = Column(String(100), nullable=False)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    s3_url = Column(String(500))
    status = Column(String(50), default="GENERATED")
