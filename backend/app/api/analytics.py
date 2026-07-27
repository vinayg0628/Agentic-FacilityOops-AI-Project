from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.services.analytics_service import compute_energy_analytics
from app.schemas.analytics import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummary)
def get_analytics(
    facility_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    analytics_data = compute_energy_analytics(
        db=db,
        facility_id=facility_id,
        start_date=start_date,
        end_date=end_date
    )
    return analytics_data
