from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.cost_models import Budget, CostRecord
from datetime import datetime

def get_budgets(db: Session, facility_id: str = None):
    query = db.query(Budget)
    if facility_id:
        query = query.filter(Budget.facility_id == facility_id)
    return query.all()

def get_budget_summary(db: Session, facility_id: str = None):
    query = db.query(Budget)
    if facility_id:
        query = query.filter(Budget.facility_id == facility_id)
    budgets = query.all()

    total_allocated = sum(b.allocated_amount for b in budgets)
    total_spent = sum(b.spent_amount for b in budgets)
    total_remaining = sum(b.remaining_amount for b in budgets)
    
    overall_status = "ON_TRACK"
    if total_spent > total_allocated:
        overall_status = "OVER_BUDGET"
    elif total_allocated > 0 and (total_spent / total_allocated) > 0.9:
        overall_status = "WARNING"

    return {
        "total_allocated": total_allocated,
        "total_spent": total_spent,
        "total_remaining": total_remaining,
        "percentage_used": (total_spent / total_allocated) * 100 if total_allocated > 0 else 0,
        "overall_status": overall_status,
        "budgets": budgets
    }
