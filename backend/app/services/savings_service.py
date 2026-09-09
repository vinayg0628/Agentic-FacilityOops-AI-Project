from sqlalchemy.orm import Session
from app.models.cost_models import SavingsTracking, OptimizationOpportunity

def get_savings_summary(db: Session, facility_id: str = None):
    query = db.query(OptimizationOpportunity)
    if facility_id:
        query = query.filter(OptimizationOpportunity.facility_id == facility_id)
    
    opportunities = query.all()
    
    total_estimated = sum(o.estimated_saving for o in opportunities if o.estimated_saving)
    total_realized = 0
    # In a real app we'd query SavingsTracking to get actual realized savings over time
    tracking_query = db.query(SavingsTracking)
    if facility_id:
        tracking_query = tracking_query.filter(SavingsTracking.facility_id == facility_id)
    trackings = tracking_query.all()
    total_realized = sum(t.realized_saving for t in trackings if t.realized_saving)

    return {
        "total_estimated_savings": total_estimated,
        "total_realized_savings": total_realized,
        "pending_savings": max(0, total_estimated - total_realized)
    }

def verify_saving(db: Session, saving_id: str, verified_amount: float):
    saving = db.query(SavingsTracking).filter(SavingsTracking.saving_id == saving_id).first()
    if saving:
        saving.realized_saving += verified_amount
        saving.cumulative_saving += verified_amount
        saving.status = "VERIFIED"
        db.commit()
        db.refresh(saving)
    return saving
