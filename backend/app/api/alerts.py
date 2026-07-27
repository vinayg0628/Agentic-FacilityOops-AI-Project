from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.alert import EnergyAlert
from app.models.facility import Facility
from app.schemas.alert import AlertResponse, AlertStatusUpdate
from app.agents.energy_agent import EnergyAgent

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    facility_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Trigger Energy Agent evaluation first to ensure fresh alerts
    agent = EnergyAgent(db)
    agent.evaluate_facility_telemetry(facility_id=facility_id)

    query = db.query(EnergyAlert, Facility.facility_name)\
        .join(Facility, EnergyAlert.facility_id == Facility.facility_id)

    if facility_id and facility_id != "ALL":
        query = query.filter(EnergyAlert.facility_id == facility_id)
    if severity and severity != "ALL":
        query = query.filter(EnergyAlert.severity == severity)
    if status and status != "ALL":
        query = query.filter(EnergyAlert.status == status)

    results = query.order_by(EnergyAlert.timestamp.desc()).all()

    alert_responses = []
    for alert_obj, fac_name in results:
        resp = AlertResponse.model_validate(alert_obj)
        resp.facility_name = fac_name
        alert_responses.append(resp)

    return alert_responses

@router.patch("/{alert_id}/status", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    db: Session = Depends(get_db)
):
    alert = db.query(EnergyAlert).filter(EnergyAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if payload.status not in ["Open", "In Progress", "Resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status value")

    alert.status = payload.status
    db.commit()
    db.refresh(alert)

    facility = db.query(Facility).filter(Facility.facility_id == alert.facility_id).first()
    resp = AlertResponse.model_validate(alert)
    resp.facility_name = facility.facility_name if facility else alert.facility_id
    return resp
