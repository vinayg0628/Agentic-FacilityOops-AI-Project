"""FastAPI routes for Security Agent — Phase B."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.agents.security_agent import SecurityAgent

router = APIRouter(prefix='/security', tags=['Security'])


# ── A. UNAUTHORIZED ACCESS ───────────────────────────────────
@router.get('/unauthorized')
def get_unauthorized_access(
    facility_id: Optional[str] = Query(None),
    hours: int = Query(24, ge=1, le=168),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """All denied access events with risk scoring."""
    return SecurityAgent(db).get_unauthorized_access(facility_id=facility_id, hours=hours, limit=limit)


# ── B. ANOMALY DETECTION ─────────────────────────────────────
@router.get('/anomalies')
def get_anomalies(
    facility_id: Optional[str] = Query(None),
    days: int = Query(14, ge=1, le=90),
    db: Session = Depends(get_db),
):
    """Run Isolation Forest anomaly detection on access patterns."""
    return SecurityAgent(db).run_anomaly_detection(facility_id=facility_id, days=days)


@router.get('/anomalies/stored')
def get_stored_anomalies(
    facility_id: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    """Return previously persisted anomaly records."""
    return SecurityAgent(db).get_stored_anomalies(facility_id=facility_id, limit=limit)


# ── C. VISITOR ZONE TRACKING ─────────────────────────────────
@router.get('/visitor-violations')
def get_visitor_violations(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Visitor zone violations — badge events outside authorized zones."""
    agent = SecurityAgent(db)
    agent.check_visitor_zones(facility_id=facility_id)
    return agent.get_visitor_violations(facility_id=facility_id)


# ── D. INCIDENT INVESTIGATION TIMELINE ───────────────────────
@router.get('/investigation')
def get_investigation(
    zone_id: str = Query(...),
    facility_id: str = Query(...),
    timestamp: Optional[str] = Query(None),
    window_hours: int = Query(2, ge=1, le=24),
    db: Session = Depends(get_db),
):
    """Pull all events around a zone/timestamp for investigation."""
    import datetime
    ts = None
    if timestamp:
        try: ts = datetime.datetime.fromisoformat(timestamp)
        except ValueError: raise HTTPException(status_code=400, detail='Invalid timestamp format')
    return SecurityAgent(db).get_incident_timeline(
        zone_id=zone_id, facility_id=facility_id,
        ts_center=ts, window_hours=window_hours,
    )


# ── EXISTING ENDPOINTS (preserved) ───────────────────────────
@router.get('/events')
def get_cctv_events(
    facility_id: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).get_cctv_events(facility_id=facility_id, limit=limit)


@router.get('/alerts')
def get_alerts(
    facility_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).get_alerts(facility_id=facility_id, status=status, severity=severity, limit=limit)


@router.get('/incidents')
def get_incidents(
    facility_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).get_incidents(facility_id=facility_id, status=status, limit=limit)


@router.get('/access-logs')
def get_access_logs(
    facility_id: Optional[str] = Query(None),
    result: Optional[str] = Query(None),
    limit: int = Query(100),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).get_access_logs(facility_id=facility_id, result=result, limit=limit)


@router.get('/visitors')
def get_visitors(
    facility_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).get_visitors(facility_id=facility_id, status=status)


@router.get('/risk')
def get_risk_summary(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).get_risk_summary(facility_id=facility_id)


@router.get('/analytics')
def get_analytics(
    facility_id: Optional[str] = Query(None),
    days: int = Query(7),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).get_analytics(facility_id=facility_id, days=days)


@router.post('/analyze')
def run_analysis(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return SecurityAgent(db).analyze_and_create_alerts(facility_id=facility_id)
