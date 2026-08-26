"""FastAPI routes for Occupancy Agent — Phase A."""
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.agents.occupancy_agent import OccupancyAgent

router = APIRouter(prefix='/occupancy', tags=['Occupancy'])


# ── A. LIVE MONITORING ──────────────────────────────────────
@router.get('')
def get_current_occupancy(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return OccupancyAgent(db).get_current_occupancy(facility_id=facility_id)


@router.get('/live')
def get_live_occupancy(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Live snapshot: current occupancy + active alert count."""
    agent   = OccupancyAgent(db)
    current = agent.get_current_occupancy(facility_id=facility_id)
    alerts  = agent.get_active_alerts(facility_id=facility_id)
    total_people   = sum(r['people_count'] for r in current)
    total_capacity = sum(r['capacity']     for r in current)
    return {
        'rooms':          current,
        'total_people':   total_people,
        'total_capacity': total_capacity,
        'avg_pct':        round(total_people / total_capacity * 100, 1) if total_capacity else 0,
        'active_alerts':  len(alerts),
        'alert_summary':  alerts[:5],
    }


@router.get('/rooms')
def get_rooms(
    facility_id: Optional[str] = Query(None),
    floor: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    from app.models.occupancy_models import Room
    q = db.query(Room)
    if facility_id: q = q.filter(Room.facility_id == facility_id)
    if floor:       q = q.filter(Room.floor == floor)
    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in q.all()]


# ── B. UTILIZATION ANALYTICS ────────────────────────────────
@router.get('/utilization')
def get_utilization(
    facility_id: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
):
    """Per-room space utilization report ranked by average occupancy."""
    return OccupancyAgent(db).get_utilization_report(facility_id=facility_id, days=days)


@router.get('/analytics')
def get_analytics(
    facility_id: Optional[str] = Query(None),
    days: int = Query(7),
    db: Session = Depends(get_db),
):
    return OccupancyAgent(db).get_analytics(facility_id=facility_id, days=days)


# ── C. OVERCROWDING ALERTS ──────────────────────────────────
@router.get('/alerts/active')
def get_active_alerts(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return currently active overcrowding alerts."""
    agent = OccupancyAgent(db)
    agent.detect_overcrowding(facility_id=facility_id)
    return agent.get_active_alerts(facility_id=facility_id)


# ── D. HEATMAPS ─────────────────────────────────────────────
@router.get('/heatmap/floor')
def get_floor_heatmap(
    facility_id: str = Query(...),
    floor: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Floor-plan tile grid colored by current occupancy."""
    return OccupancyAgent(db).get_floor_heatmap(facility_id=facility_id, floor=floor)


@router.get('/heatmap/matrix')
def get_heatmap_matrix(
    facility_id: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """7-day × 24-hour occupancy pattern matrix."""
    return OccupancyAgent(db).get_heatmap_matrix(facility_id=facility_id, days=days)


@router.get('/heatmap')
def get_heatmap(
    facility_id: str = Query(...),
    floor: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return OccupancyAgent(db).get_floor_heatmap(facility_id=facility_id, floor=floor)


# ── E. FORECASTING ──────────────────────────────────────────
@router.get('/forecast/ml')
def get_forecast_ml(
    facility_id: str = Query(...),
    hours_ahead: int = Query(24, ge=1, le=72),
    db: Session = Depends(get_db),
):
    """ML-powered occupancy forecast (RandomForestRegressor)."""
    return OccupancyAgent(db).get_forecast_ml(facility_id=facility_id, hours_ahead=hours_ahead)


@router.get('/forecast')
def get_forecast(
    facility_id: str = Query(...),
    room_id: Optional[str] = Query(None),
    hours_ahead: int = Query(24),
    db: Session = Depends(get_db),
):
    return OccupancyAgent(db).get_forecast(facility_id=facility_id, room_id=room_id, hours_ahead=hours_ahead)


# ── F. RECOMMENDATIONS ──────────────────────────────────────
@router.get('/recommendations')
def get_recommendations(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return OccupancyAgent(db).get_recommendations(facility_id=facility_id)


# ── SIMULATE SENSOR EVENT ────────────────────────────────────
class SensorEvent(BaseModel):
    facility_id: str
    room_id: str
    people_count: int
    entry_count: int = 0
    exit_count: int = 0

@router.post('/simulate')
def simulate_sensor_event(event: SensorEvent, db: Session = Depends(get_db)):
    """Inject a simulated occupancy sensor reading."""
    from app.models.occupancy_models import Room, OccupancyReading
    import datetime
    room = db.query(Room).filter(Room.room_id == event.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail='Room not found')
    rate = event.people_count / room.capacity if room.capacity > 0 else 0.0
    reading = OccupancyReading(
        facility_id=event.facility_id,
        room_id=event.room_id,
        floor=room.floor,
        timestamp=datetime.datetime.utcnow(),
        people_count=event.people_count,
        entry_count=event.entry_count,
        exit_count=event.exit_count,
        capacity=room.capacity,
        occupancy_rate=rate,
        sensor_id='SIM-001',
    )
    db.add(reading)
    db.commit()
    return {'status': 'ok', 'room_id': event.room_id, 'occupancy_pct': round(rate * 100, 1)}


@router.get('/{facility_id}')
def get_facility_occupancy(facility_id: str, db: Session = Depends(get_db)):
    agent = OccupancyAgent(db)
    return {
        'current':  agent.get_current_occupancy(facility_id=facility_id),
        'analytics': agent.get_analytics(facility_id=facility_id),
    }
