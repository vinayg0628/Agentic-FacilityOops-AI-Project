import random
from datetime import datetime, timezone, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session
from app.models.cost_models import CostRecord, Budget, BudgetTransaction
from app.models.vendor_models import Vendor, VendorContract
from app.models.event_models import AgentEvent
from app.core.database import SessionLocal

def seed_phase0_data(db: Session = None):
    close_db = False
    if not db:
        db = SessionLocal()
        close_db = True

    try:
        # Check if already seeded, if so wipe
        db.query(BudgetTransaction).delete()
        db.query(CostRecord).delete()
        db.query(Budget).delete()
        db.query(VendorContract).delete()
        db.query(Vendor).delete()
        db.query(AgentEvent).delete()
        db.commit()

        facility_ids = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005']
        
        # 1. Seed Vendors
        vendors = [
            Vendor(vendor_name="Acme HVAC Services", service_type="Maintenance", contract_start=datetime(2025,1,1), contract_end=datetime(2026,12,31), contract_value=420000, SLA_percentage=94.0, performance_score=91.0, response_time=4.0, quality_score=9.2),
            Vendor(vendor_name="Spark Electrical", service_type="Maintenance", contract_start=datetime(2025,1,1), contract_end=datetime(2026,12,31), contract_value=610000, SLA_percentage=81.0, performance_score=72.0, response_time=12.0, quality_score=7.1),
            Vendor(vendor_name="SecureNet", service_type="Security", contract_start=datetime(2025,1,1), contract_end=datetime(2026,12,31), contract_value=350000, SLA_percentage=98.0, performance_score=94.0, response_time=1.0, quality_score=9.5),
            Vendor(vendor_name="ClearFlow Water", service_type="Water", contract_start=datetime(2025,1,1), contract_end=datetime(2026,12,31), contract_value=120000, SLA_percentage=99.0, performance_score=95.0, response_time=2.0, quality_score=9.8)
        ]
        db.add_all(vendors)
        db.commit()

        v_hvac = vendors[0].vendor_id
        v_elec = vendors[1].vendor_id
        v_sec = vendors[2].vendor_id
        v_water = vendors[3].vendor_id

        # 2. Seed Budgets for the current year
        now = datetime.now(timezone.utc)
        current_year = now.year

        categories = {
            "Energy": 1000000,
            "Maintenance": 600000,
            "Security": 400000,
            "Water": 150000,
            "Vendor": 500000
        }

        for fac in facility_ids:
            for cat, amount in categories.items():
                budget = Budget(
                    facility_id=fac,
                    department="Operations",
                    category=cat,
                    budget_period=f"{current_year}",
                    allocated_amount=amount * 12, # Annual
                    spent_amount=0.0
                )
                db.add(budget)
        db.commit()

        # 3. Seed Cost Records (Monthly for the last 6 months)
        start_date = now - relativedelta(months=5)
        start_date = start_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        for fac in facility_ids:
            for i in range(6):
                month_date = start_date + relativedelta(months=i)
                
                # Base costs
                e_cost = 840000 + random.randint(-20000, 20000)
                m_cost = 420000 + random.randint(-10000, 10000)
                s_cost = 310000 + random.randint(-5000, 5000)
                w_cost = 120000 + random.randint(-2000, 2000)
                v_cost = 480000 + random.randint(-10000, 10000)

                # ANOMALY INJECTION: Let's inject a spike in the month of May (or 2 months ago)
                is_anomaly_month = (i == 3) # e.g. 2 months ago
                if is_anomaly_month:
                    m_cost = 790000 # Spike from 4.2L to 7.9L (84% increase)
                    
                    # Add Agent Events for that anomaly month to explain it
                    for _ in range(14):
                        db.add(AgentEvent(
                            facility_id=fac, agent="maintenance", event_type="EMERGENCY_REPAIR",
                            severity="HIGH", timestamp=month_date + timedelta(days=random.randint(1, 28)),
                            data={"description": "Emergency repair required on HVAC unit"}
                        ))
                    
                    db.add(AgentEvent(
                            facility_id=fac, agent="energy", event_type="HIGH_HVAC_CONSUMPTION",
                            severity="HIGH", timestamp=month_date + timedelta(days=15),
                            data={"increase_pct": 25}
                    ))

                records = [
                    CostRecord(facility_id=fac, category="Energy", amount=e_cost, timestamp=month_date),
                    CostRecord(facility_id=fac, category="Maintenance", amount=m_cost, timestamp=month_date, vendor_id=v_hvac if is_anomaly_month else None),
                    CostRecord(facility_id=fac, category="Security", amount=s_cost, timestamp=month_date, vendor_id=v_sec),
                    CostRecord(facility_id=fac, category="Water", amount=w_cost, timestamp=month_date, vendor_id=v_water),
                    CostRecord(facility_id=fac, category="Vendor", amount=v_cost, timestamp=month_date, vendor_id=v_elec)
                ]
                db.add_all(records)
                
                # Update budgets
                for r in records:
                    budget = db.query(Budget).filter_by(facility_id=fac, category=r.category, budget_period=str(current_year)).first()
                    if budget:
                        budget.spent_amount += r.amount
                        db.add(BudgetTransaction(budget_id=budget.budget_id, amount=r.amount, timestamp=month_date, cost_id=r.cost_id))

        db.commit()

        # Update budget calculations
        budgets = db.query(Budget).all()
        for b in budgets:
            b.remaining_amount = b.allocated_amount - b.spent_amount
            b.percentage_used = (b.spent_amount / b.allocated_amount) * 100 if b.allocated_amount > 0 else 0
            # simple projection
            b.projected_final_spend = b.spent_amount * 2 # rough
            b.status = "OVER_BUDGET" if b.projected_final_spend > b.allocated_amount else "ON_TRACK"
        db.commit()

    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    seed_phase0_data()
