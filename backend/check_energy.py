import sys
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models.energy import EnergyUsage
from app.models.facility import Facility
from sqlalchemy import func

db = SessionLocal()

print("=" * 60)
print("  ENERGY AGENT — Records Per Facility")
print("=" * 60)

results = (
    db.query(
        Facility.facility_id,
        Facility.facility_name,
        Facility.facility_type,
        func.count(EnergyUsage.energy_id).label("total_records")
    )
    .outerjoin(EnergyUsage, Facility.facility_id == EnergyUsage.facility_id)
    .group_by(Facility.facility_id, Facility.facility_name, Facility.facility_type)
    .order_by(Facility.facility_id)
    .all()
)

grand_total = 0
for r in results:
    print(f"\n  {r.facility_id}  |  {r.facility_name}")
    print(f"             Type    : {r.facility_type}")
    print(f"             Records : {r.total_records:,}")
    grand_total += r.total_records

print("\n" + "=" * 60)
print(f"  GRAND TOTAL : {grand_total:,} records across {len(results)} facilities")
print("=" * 60)

# Date range
from app.models.energy import EnergyUsage as EU
from sqlalchemy import func as F
date_range = db.query(F.min(EU.timestamp), F.max(EU.timestamp)).first()
print(f"\n  Date Range  : {date_range[0]} → {date_range[1]}")

db.close()
