from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any

from app.core.database import get_db
from app.services.ai_summary_service import ai_service
from app.api.executive_routes import get_top_opportunities, get_cost_distribution

router = APIRouter(prefix="/ai", tags=["ai"])

class QuestionRequest(BaseModel):
    question: str
    facility_id: str = "ALL"

@router.post("/ask")
def ask_facility_ai(req: QuestionRequest, db: Session = Depends(get_db)):
    # Gather context based on heuristics or just load general context
    q_lower = req.question.lower()
    context = {}
    
    if "save" in q_lower or "opportunities" in q_lower:
        context["opportunities"] = get_top_opportunities(req.facility_id, 5, db)
        
    if "cost" in q_lower or "spend" in q_lower:
        context["cost_distribution"] = get_cost_distribution(req.facility_id, db)

    answer = ai_service.answer_question(req.question, context)
    return {"answer": answer}
