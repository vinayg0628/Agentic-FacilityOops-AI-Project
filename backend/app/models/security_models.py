"""SQLAlchemy ORM models for Security Agent — Phase B."""
import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, Index
from app.core.database import Base


class AccessLog(Base):
    __tablename__ = "access_logs"
    access_id    = Column(Integer, primary_key=True, autoincrement=True)
    facility_id  = Column(String(50), nullable=False, index=True)
    zone_id      = Column(String(50), nullable=False, index=True)
    room_id      = Column(String(50), nullable=True)
    user_id      = Column(String(100), nullable=False, index=True)
    user_type    = Column(String(50), default='Employee')
    timestamp    = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    access_method = Column(String(30), default='Card')
    direction    = Column(String(10), default='Entry')
    result       = Column(String(10), nullable=False)  # Allowed | Denied
    reason       = Column(String(200), nullable=True)
    __table_args__ = (
        Index('ix_access_fac_ts',  'facility_id', 'timestamp'),
        Index('ix_access_user_ts', 'user_id',     'timestamp'),
    )


class Visitor(Base):
    __tablename__ = "visitors"
    visitor_id    = Column(String(50), primary_key=True, index=True)
    facility_id   = Column(String(50), nullable=False, index=True)
    visitor_name  = Column(String(100), nullable=False)
    visitor_type  = Column(String(50), default='Business')
    host_employee = Column(String(100), nullable=False)
    check_in_time = Column(DateTime, nullable=False)
    check_out_time = Column(DateTime, nullable=True)
    badge_id      = Column(String(50), nullable=True)
    current_zone  = Column(String(50), nullable=True)
    allowed_zones = Column(Text, nullable=True)  # JSON list of allowed zone_ids
    status        = Column(String(20), default='active')


class CCTVEvent(Base):
    __tablename__ = "cctv_events"
    event_id     = Column(Integer, primary_key=True, autoincrement=True)
    facility_id  = Column(String(50), nullable=False, index=True)
    camera_id    = Column(String(50), nullable=False)
    zone_id      = Column(String(50), nullable=False, index=True)
    timestamp    = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    event_type   = Column(String(80), nullable=False)
    person_count = Column(Integer, default=1)
    confidence   = Column(Float, default=0.90)
    severity     = Column(String(20), default='Low')
    __table_args__ = (Index('ix_cctv_fac_ts', 'facility_id', 'timestamp'),)


class SecurityIncident(Base):
    __tablename__ = "security_incidents"
    incident_id          = Column(Integer, primary_key=True, autoincrement=True)
    facility_id          = Column(String(50), nullable=False, index=True)
    zone_id              = Column(String(50), nullable=False)
    timestamp            = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    incident_type        = Column(String(100), nullable=False)
    severity             = Column(String(20), nullable=False)
    risk_score           = Column(Float, default=0.0)
    description          = Column(String(500), nullable=False)
    recommended_action   = Column(String(300), nullable=True)
    investigation_status = Column(String(30), default='Open')
    assigned_to          = Column(String(100), nullable=True)
    resolved_at          = Column(DateTime, nullable=True)
    __table_args__ = (Index('ix_incident_fac_ts', 'facility_id', 'timestamp'),)


class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    alert_id           = Column(Integer, primary_key=True, autoincrement=True)
    facility_id        = Column(String(50), nullable=False, index=True)
    zone_id            = Column(String(50), nullable=True)
    timestamp          = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    alert_type         = Column(String(100), nullable=False)
    severity           = Column(String(20), nullable=False)
    risk_score         = Column(Float, default=0.0)
    message            = Column(String(500), nullable=False)
    recommended_action = Column(String(300), nullable=True)
    status             = Column(String(20), default='Open')
    user_id            = Column(String(100), nullable=True)
    __table_args__ = (Index('ix_alert_fac_ts', 'facility_id', 'timestamp'),)


class AnomalyLog(Base):
    """Records anomalous access patterns detected by Isolation Forest."""
    __tablename__ = "anomaly_logs"
    anomaly_id       = Column(Integer, primary_key=True, autoincrement=True)
    facility_id      = Column(String(50), nullable=False, index=True)
    user_id          = Column(String(100), nullable=False, index=True)
    zone_id          = Column(String(50), nullable=True)
    timestamp        = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    anomaly_score    = Column(Float, default=0.0)   # Isolation Forest score (negative = anomalous)
    anomaly_type     = Column(String(100))           # e.g. 'after_hours', 'zone_sequence', 'high_frequency'
    description      = Column(String(300))
    hour_of_day      = Column(Integer, default=0)
    day_of_week      = Column(Integer, default=0)
    is_weekend       = Column(Boolean, default=False)
    access_frequency = Column(Float, default=1.0)   # accesses per hour for this user
    zone_risk_level  = Column(Float, default=0.0)   # 0=low, 1=high risk zone
    status           = Column(String(20), default='New')  # New | Reviewed | False Positive
    __table_args__ = (Index('ix_anomaly_fac_ts', 'facility_id', 'timestamp'),)


class VisitorZoneViolation(Base):
    """Records visitor badge events outside their authorized zones."""
    __tablename__ = "visitor_zone_violations"
    violation_id    = Column(Integer, primary_key=True, autoincrement=True)
    facility_id     = Column(String(50), nullable=False, index=True)
    visitor_id      = Column(String(50), nullable=False)
    visitor_name    = Column(String(100))
    zone_id         = Column(String(50))
    timestamp       = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    authorized_zones = Column(Text)   # JSON list
    violation_type  = Column(String(100), default='Unauthorized Zone')
    risk_score      = Column(Float, default=60.0)
    status          = Column(String(20), default='Open')
