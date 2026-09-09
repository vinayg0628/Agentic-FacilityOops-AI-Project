import logging
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.cost_models import CostRecord, Budget, ResourceAllocation, CostAnomaly, OptimizationOpportunity, SavingsTracking
from app.models.vendor_models import Vendor, VendorContract
from app.models.facility import Facility
from app.core.database import SessionLocal, engine, Base

logger = logging.getLogger("facilityops")

def seed_cost_data(db: Session):
    facilities = db.query(Facility).all()
    if not facilities:
        logger.warning("No facilities found. Run energy/facility seeding first.")
        return

    # Create some vendors
    existing_vendors = db.query(Vendor).count()
    if existing_vendors == 0:
        vendors = [
            Vendor(vendor_name="TechSecure Services", service_type="Security", SLA_percentage=98.5, performance_score=4.2, response_time=1.5, quality_score=4.0),
            Vendor(vendor_name="EcoHVAC Maintenance", service_type="Maintenance", SLA_percentage=92.1, performance_score=3.8, response_time=4.0, quality_score=3.5),
            Vendor(vendor_name="CleanFlow Water Solutions", service_type="Water", SLA_percentage=99.0, performance_score=4.8, response_time=2.0, quality_score=4.6),
            Vendor(vendor_name="SparkPower Energy", service_type="Energy", SLA_percentage=99.9, performance_score=4.9, response_time=0.5, quality_score=4.9)
        ]
        db.add_all(vendors)
        db.commit()
        
        # Add Contracts
        for v in vendors:
            contract = VendorContract(
                vendor_id=v.vendor_id,
                contract_value=random.uniform(500000, 2000000),
                SLA="Standard Corporate SLA",
                utilization=random.uniform(0.5, 0.95),
                spending=random.uniform(100000, 500000),
                performance=v.performance_score,
                penalties=random.uniform(0, 10000)
            )
            db.add(contract)
        db.commit()

    vendors = db.query(Vendor).all()
    
    # Create Cost Records and Budgets
    existing_costs = db.query(CostRecord).count()
    if existing_costs == 0:
        categories = ["Energy", "Maintenance", "Security", "Water", "Labor", "Vendor", "Administration", "Equipment", "Operations"]
        for fac in facilities:
            # Create Budgets
            for cat in categories:
                allocated = random.uniform(100000, 1000000)
                spent = allocated * random.uniform(0.6, 1.1)
                status = "ON_TRACK"
                if spent > allocated:
                    status = "OVER_BUDGET"
                elif spent > allocated * 0.9:
                    status = "WARNING"
                
                budget = Budget(
                    facility_id=fac.facility_id,
                    category=cat,
                    budget_period="2023-11",
                    allocated_amount=allocated,
                    spent_amount=spent,
                    remaining_amount=allocated - spent,
                    percentage_used=(spent / allocated) * 100 if allocated > 0 else 0,
                    projected_final_spend=spent * 1.1,
                    variance=allocated - (spent * 1.1),
                    status=status
                )
                db.add(budget)
            
            # Create Cost Records
            now = datetime.now(timezone.utc)
            for _ in range(50):
                cat = random.choice(categories)
                vid = random.choice(vendors).vendor_id if random.random() > 0.5 else None
                rec = CostRecord(
                    facility_id=fac.facility_id,
                    category=cat,
                    amount=random.uniform(1000, 50000),
                    timestamp=now - timedelta(days=random.randint(0, 60)),
                    vendor_id=vid,
                    description=f"Automated cost entry for {cat}"
                )
                db.add(rec)
            
            # Create some Optimization Opportunities
            opp1 = OptimizationOpportunity(
                facility_id=fac.facility_id,
                category="Energy",
                title="HVAC Optimization via VFD Upgrade",
                current_cost=150000,
                estimated_saving=35000,
                implementation_cost=120000,
                annual_saving=35000 * 12,
                ROI=((35000 * 12 - 120000) / 120000) * 100,
                payback_period=120000 / 35000,
                priority="HIGH",
                confidence=0.88
            )
            db.add(opp1)
            
        db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    seed_cost_data(db)
    db.close()
    print("Cost data seeded successfully.")
