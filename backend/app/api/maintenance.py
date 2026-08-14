from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.models.equipment import Equipment, MaintenanceMonitoring, MaintenanceAlert, MaintenanceSchedule
from app.agents.maintenance_agent import MaintenanceAgent
from app.services.maintenance_analytics_service import (
    compute_maintenance_analytics,
    get_equipment_health_scores,
    get_maintenance_predictions
)

router = APIRouter(prefix='/maintenance', tags=['maintenance'])

class MonitoringCreate(BaseModel):
    equipment_id: int
    temperature: float
    vibration: float
    runtime_hours: float
    pressure: float
    humidity: float
    power_consumption: float
    operating_status: str

@router.get('/health-score')
def get_health_scores(facility_id: Optional[str] = None, db: Session = Depends(get_db)):
    return get_equipment_health_scores(db, facility_id)

@router.get('/predictions')
def get_predictions(facility_id: Optional[str] = None, db: Session = Depends(get_db)):
    return get_maintenance_predictions(db, facility_id)

@router.get('/schedule')
def list_schedules(
    equipment_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceSchedule).join(Equipment)
    if equipment_id:
        query = query.filter(MaintenanceSchedule.equipment_id == equipment_id)
    if status and status.upper() != 'ALL':
        query = query.filter(MaintenanceSchedule.status == status)
    if priority and priority.upper() != 'ALL':
        query = query.filter(MaintenanceSchedule.priority == priority)
        
    schedules = query.all()
    return [{
        'schedule_id': s.schedule_id,
        'equipment_name': s.equipment.equipment_name,
        'equipment_type': s.equipment.equipment_type,
        'next_service_date': s.next_service_date.isoformat() if s.next_service_date else None,
        'maintenance_type': s.maintenance_type,
        'priority': s.priority,
        'assigned_engineer': s.assigned_engineer,
        'status': s.status,
        'estimated_duration_hours': s.estimated_duration_hours,
        'estimated_cost_usd': s.estimated_cost_usd,
    } for s in schedules]

@router.get('/alerts')
def list_alerts(
    equipment_id: Optional[int] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceAlert).join(Equipment)
    if equipment_id:
        query = query.filter(MaintenanceAlert.equipment_id == equipment_id)
    if severity and severity.upper() != 'ALL':
        query = query.filter(MaintenanceAlert.severity == severity)
    if status and status.upper() != 'ALL':
        query = query.filter(MaintenanceAlert.status == status)
        
    alerts = query.order_by(MaintenanceAlert.timestamp.desc()).all()
    return [{
        **a.__dict__,
        'equipment_name': a.equipment.equipment_name
    } for a in alerts]

@router.post('/')
def create_monitoring_record(record: MonitoringCreate, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.equipment_id == record.equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    db_rec = MaintenanceMonitoring(**record.dict())
    db.add(db_rec)
    db.commit()
    
    # Fetch recent history and run rule engine
    recent = db.query(MaintenanceMonitoring).filter(
        MaintenanceMonitoring.equipment_id == eq.equipment_id
    ).order_by(MaintenanceMonitoring.timestamp.desc()).limit(10).all()
    
    recent_dict = [{
        'temperature': r.temperature, 'vibration': r.vibration, 
        'runtime_hours': r.runtime_hours, 'pressure': r.pressure, 
        'power_consumption': r.power_consumption, 'humidity': r.humidity,
        'operating_status': r.operating_status
    } for r in reversed(recent)]
    
    agent = MaintenanceAgent()
    alerts = agent.run_rule_engine({'equipment_type': eq.equipment_type}, recent_dict)
    
    created_alerts = []
    for a in alerts:
        db_alert = MaintenanceAlert(
            equipment_id=eq.equipment_id,
            severity=a['severity'],
            issue=a['issue'],
            recommendation=a['recommendation'],
            status='Open'
        )
        db.add(db_alert)
        created_alerts.append(a)
        
    db.commit()
    
    return {
        "status": "success",
        "record_id": db_rec.monitoring_id,
        "alerts_generated": len(created_alerts),
        "alerts": created_alerts
    }

@router.get('/analytics')
def get_analytics(facility_id: Optional[str] = None, db: Session = Depends(get_db)):
    return compute_maintenance_analytics(db, facility_id)

@router.get('/recommendations')
def get_recommendations(facility_id: Optional[str] = None, db: Session = Depends(get_db)):
    analytics = compute_maintenance_analytics(db, facility_id)
    return analytics.get('ai_recommendations', [])

@router.patch('/alerts/{alert_id}/status')
def update_alert_status(alert_id: int, status: str = Query(..., pattern="^(Open|Acknowledged|Resolved)$"), db: Session = Depends(get_db)):
    alert = db.query(MaintenanceAlert).filter(MaintenanceAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = status
    db.commit()
    db.refresh(alert)
    return alert

@router.patch('/schedule/{schedule_id}/status')
def update_schedule_status(schedule_id: int, status: str, db: Session = Depends(get_db)):
    sched = db.query(MaintenanceSchedule).filter(MaintenanceSchedule.schedule_id == schedule_id).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    sched.status = status
    db.commit()
    db.refresh(sched)
    return sched
