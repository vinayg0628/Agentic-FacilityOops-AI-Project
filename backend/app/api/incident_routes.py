"""FastAPI routes for Incident Investigation."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.agents.security_agent import SecurityAgent

router = APIRouter(prefix='/incidents', tags=['Incidents'])


class IncidentUpdate(BaseModel):
    status: str
    assigned_to: Optional[str] = None


@router.get('')
def list_incidents(
    facility_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50),
    db: Session = Depends(get_db),
):
    agent = SecurityAgent(db)
    return agent.get_incidents(facility_id=facility_id, status=status, limit=limit)


@router.get('/{incident_id}')
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    agent = SecurityAgent(db)
    result = agent.get_incident_detail(incident_id)
    if not result:
        raise HTTPException(status_code=404, detail='Incident not found')
    return result


@router.put('/{incident_id}')
def update_incident(
    incident_id: int,
    body: IncidentUpdate,
    db: Session = Depends(get_db),
):
    agent = SecurityAgent(db)
    result = agent.update_incident_status(incident_id, body.status, body.assigned_to)
    if not result:
        raise HTTPException(status_code=404, detail='Incident not found')
    return result