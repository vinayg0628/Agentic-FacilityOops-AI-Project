from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.cost_service import get_cost_overview, get_cost_distribution
from app.agents.cost_agent import CostAgent

router = APIRouter(prefix="/cost", tags=["Cost Optimization"])

@router.get("/overview")
def read_cost_overview(facility_id: str = None, db: Session = Depends(get_db)):
    return get_cost_overview(db, facility_id)

@router.get("/distribution")
def read_cost_distribution(facility_id: str = None, db: Session = Depends(get_db)):
    return get_cost_distribution(db, facility_id)

@router.post("/evaluate")
def trigger_cost_evaluation(facility_id: str = None, db: Session = Depends(get_db)):
    agent = CostAgent(db)
    agent.evaluate_cost_efficiency(facility_id)
    return {"status": "Evaluation completed"}
