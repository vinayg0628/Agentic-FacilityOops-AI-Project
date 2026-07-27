from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.agents.energy_agent import EnergyAgent
from app.schemas.recommendation import RecommendationItem

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationItem])
def get_recommendations(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    agent = EnergyAgent(db)
    recommendations = agent.generate_ai_recommendations(facility_id=facility_id)
    return recommendations
