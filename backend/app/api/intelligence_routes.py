"""FastAPI routes for the cross-agent Intelligence Engine."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.agents.intelligence_engine import IntelligenceEngine
from app.services.event_service import event_service

router = APIRouter(prefix='/intelligence', tags=['Intelligence'])


@router.get('/events')
def get_cross_agent_events(
    facility_id: Optional[str] = Query(None),
    agent: Optional[str] = Query(None),
    limit: int = Query(100),
):
    return event_service.get_events(facility_id=facility_id, agent=agent, limit=limit)


@router.get('/insights')
def get_insights(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    engine = IntelligenceEngine(db)
    return engine.get_insights(facility_id=facility_id)


@router.get('/recommendations')
def get_combined_recommendations(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    engine = IntelligenceEngine(db)
    return engine.get_recommendations(facility_id=facility_id)