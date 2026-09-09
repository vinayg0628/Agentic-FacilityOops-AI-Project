from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.vendor_models import Vendor, VendorContract
from app.models.cost_models import CostRecord

def get_vendors(db: Session):
    return db.query(Vendor).all()

def get_vendor_performance(db: Session, vendor_id: str):
    vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
    if not vendor:
        return None
    contracts = db.query(VendorContract).filter(VendorContract.vendor_id == vendor_id).all()
    
    return {
        "vendor": vendor,
        "contracts": contracts
    }

def get_vendor_optimization_opportunities(db: Session):
    # Dummy logic to identify underperforming or expensive vendors
    vendors = db.query(Vendor).all()
    opportunities = []
    
    for v in vendors:
        if v.SLA_percentage and v.SLA_percentage < 95.0:
            opportunities.append({
                "vendor_id": v.vendor_id,
                "vendor_name": v.vendor_name,
                "issue": f"Low SLA Compliance ({v.SLA_percentage}%)",
                "recommendation": "Renegotiate contract or consider alternative vendor with >98% SLA."
            })
        if v.performance_score and v.performance_score < 4.0:
            opportunities.append({
                "vendor_id": v.vendor_id,
                "vendor_name": v.vendor_name,
                "issue": f"Poor Performance Score ({v.performance_score}/5.0)",
                "recommendation": "Review recent service tickets and enforce SLA penalties."
            })
            
    return opportunities
