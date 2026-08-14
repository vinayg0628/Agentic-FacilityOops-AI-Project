"""
Energy Data Bulk Seeder
========================
Generates 10,000 realistic hourly energy records per facility.
Total: 50,000 records across 5 facilities.

Features:
- Facility-specific baselines (IT Park vs Hospital vs Mall etc.)
- Time-of-day patterns (peak hours, night hours, off-peak)
- Day-of-week patterns (weekday vs weekend)
- Seasonal temperature variation
- Occasional spikes (5% chance) to trigger AI alerts
- Solar generation during daylight hours
- Bulk insert via SQLAlchemy Core (very fast)
"""

import sys
import random
import math
import datetime
import time

sys.path.insert(0, '.')

from app.core.database import SessionLocal, engine
from app.models.energy import EnergyUsage
from sqlalchemy import text

# ─────────────────────────────────────────────────────────────
#  Config
# ─────────────────────────────────────────────────────────────
RECORDS_PER_FACILITY = 10_000
START_DATE = datetime.datetime(2025, 1, 1, 0, 0, 0)   # 1 year of data

random.seed(42)

# ─────────────────────────────────────────────────────────────
#  Facility-specific energy profiles
# ─────────────────────────────────────────────────────────────
FACILITY_PROFILES = {
    "FAC-001": {
        "name": "CyberTech IT Park",
        "elec_base": 280.0,      # kWh/hr — high server loads
        "hvac_ratio": 0.38,      # HVAC as % of electricity
        "lighting_ratio": 0.08,
        "water_base": 1200.0,    # liters/hr
        "solar_capacity": 45.0,  # kWh peak solar
        "peak_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        "peak_multiplier": 1.35,
        "weekend_multiplier": 0.65,
        "temp_base": 26.0,
    },
    "FAC-002": {
        "name": "St. Jude General Hospital",
        "elec_base": 320.0,      # Hospitals run 24/7
        "hvac_ratio": 0.42,
        "lighting_ratio": 0.12,
        "water_base": 3500.0,    # Very high water usage
        "solar_capacity": 30.0,
        "peak_hours": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        "peak_multiplier": 1.20,
        "weekend_multiplier": 0.92,  # Hospitals barely drop on weekends
        "temp_base": 22.0,       # Strictly controlled temp
    },
    "FAC-003": {
        "name": "Pacific Innovation University",
        "elec_base": 210.0,
        "hvac_ratio": 0.35,
        "lighting_ratio": 0.15,
        "water_base": 2800.0,
        "solar_capacity": 60.0,  # Large campus, lots of solar
        "peak_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        "peak_multiplier": 1.40,
        "weekend_multiplier": 0.45,  # Very low on weekends
        "temp_base": 28.0,
    },
    "FAC-004": {
        "name": "Grand Horizon Shopping Mall",
        "elec_base": 350.0,      # High lighting + HVAC
        "hvac_ratio": 0.45,
        "lighting_ratio": 0.22,
        "water_base": 2200.0,
        "solar_capacity": 40.0,
        "peak_hours": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
        "peak_multiplier": 1.50,
        "weekend_multiplier": 1.25,  # Malls busier on weekends!
        "temp_base": 24.0,
    },
    "FAC-005": {
        "name": "Apex Precision Factory",
        "elec_base": 420.0,      # Heavy machinery
        "hvac_ratio": 0.25,
        "lighting_ratio": 0.10,
        "water_base": 4500.0,    # Industrial water use
        "solar_capacity": 80.0,  # Large roof solar
        "peak_hours": [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        "peak_multiplier": 1.60,
        "weekend_multiplier": 0.30,  # Factory mostly closed on weekends
        "temp_base": 30.0,
    },
}

# ─────────────────────────────────────────────────────────────
#  Helper: generate one realistic record
# ─────────────────────────────────────────────────────────────
def generate_record(facility_id, profile, timestamp):
    hour     = timestamp.hour
    month    = timestamp.month
    weekday  = timestamp.weekday()  # 0=Mon, 6=Sun
    is_weekend = weekday >= 5

    # Time-of-day multiplier
    if hour in profile["peak_hours"]:
        tod_mult = profile["peak_multiplier"]
    elif hour in [22, 23, 0, 1, 2, 3, 4]:
        tod_mult = 0.55   # Night hours
    else:
        tod_mult = 0.85   # Shoulder hours

    # Weekend multiplier
    day_mult = profile["weekend_multiplier"] if is_weekend else 1.0

    # Seasonal multiplier (summer peak in Jun–Aug)
    seasonal = 1.0 + 0.15 * math.sin(2 * math.pi * (month - 3) / 12)

    # Occasional spike (5% chance) to test alert engine
    spike = random.uniform(1.25, 1.55) if random.random() < 0.05 else 1.0

    # Random noise ±8%
    noise = random.uniform(0.92, 1.08)

    # Calculate electricity
    base_mult = tod_mult * day_mult * seasonal * spike * noise
    electricity = round(profile["elec_base"] * base_mult, 2)

    # HVAC: higher in summer, lower at night
    hvac_seasonal = 1.0 + 0.25 * math.sin(2 * math.pi * (month - 3) / 12)
    hvac = round(electricity * profile["hvac_ratio"] * hvac_seasonal * random.uniform(0.9, 1.1), 2)

    # Lighting: zero at night if not hospital/mall
    if hour in [22, 23, 0, 1, 2, 3]:
        lighting_mod = 0.15 if facility_id in ["FAC-002", "FAC-004"] else 0.05
    else:
        lighting_mod = 1.0
    lighting = round(electricity * profile["lighting_ratio"] * lighting_mod * random.uniform(0.9, 1.1), 2)

    # Solar: only during daylight (6AM–7PM), peaks at noon
    if 6 <= hour <= 19:
        solar_factor = math.sin(math.pi * (hour - 6) / 13)  # peak at ~noon
        solar_seasonal = 0.7 + 0.3 * math.sin(2 * math.pi * (month - 3) / 12)  # more in summer
        solar = round(profile["solar_capacity"] * solar_factor * solar_seasonal * random.uniform(0.85, 1.0), 2)
    else:
        solar = 0.0

    # Water usage
    water_mult = tod_mult * day_mult * random.uniform(0.88, 1.12)
    water = round(profile["water_base"] * water_mult, 1)

    # Power factor (slightly worse during spikes)
    pf = round(random.uniform(0.87, 0.98) - (0.04 if spike > 1.2 else 0.0), 3)
    pf = max(0.80, min(0.99, pf))

    # Ambient temperature
    seasonal_temp = profile["temp_base"] + 4 * math.sin(2 * math.pi * (month - 3) / 12)
    diurnal_temp  = 3 * math.sin(2 * math.pi * (hour - 6) / 24)
    temperature   = round(seasonal_temp + diurnal_temp + random.uniform(-1.5, 1.5), 1)

    # Humidity (inversely correlated with temp in controlled environments)
    humidity = round(random.uniform(40.0, 75.0), 1)

    return {
        "facility_id":          facility_id,
        "timestamp":            timestamp,
        "electricity_kwh":      electricity,
        "water_liters":         water,
        "hvac_kwh":             hvac,
        "lighting_kwh":         lighting,
        "solar_generation_kwh": solar,
        "power_factor":         pf,
        "temperature":          temperature,
        "humidity":             humidity,
    }

# ─────────────────────────────────────────────────────────────
#  Main seeder
# ─────────────────────────────────────────────────────────────
def seed_energy_data():
    db = SessionLocal()

    # Check existing counts
    print("\n  Current records:")
    for fid in FACILITY_PROFILES:
        count = db.query(EnergyUsage).filter(EnergyUsage.facility_id == fid).count()
        print(f"    {fid}: {count:,} existing records")

    print(f"\n  Generating {RECORDS_PER_FACILITY:,} records x 5 facilities = {RECORDS_PER_FACILITY*5:,} total...")
    print("  (hourly records, starting 2025-01-01)\n")

    overall_start = time.time()

    for facility_id, profile in FACILITY_PROFILES.items():
        print(f"  [{facility_id}] {profile['name']} ...", end=" ", flush=True)
        t0 = time.time()

        batch = []
        current_ts = START_DATE

        for i in range(RECORDS_PER_FACILITY):
            record = generate_record(facility_id, profile, current_ts)
            batch.append(record)
            current_ts += datetime.timedelta(hours=1)

            # Bulk insert every 1,000 records
            if len(batch) == 1000:
                db.bulk_insert_mappings(EnergyUsage, batch)
                db.commit()
                batch = []

        # Insert remaining
        if batch:
            db.bulk_insert_mappings(EnergyUsage, batch)
            db.commit()

        elapsed = round(time.time() - t0, 1)
        print(f"Done in {elapsed}s")

    # Final verification
    print("\n" + "=" * 60)
    print("  FINAL COUNTS")
    print("=" * 60)
    grand_total = 0
    for fid, profile in FACILITY_PROFILES.items():
        count = db.query(EnergyUsage).filter(EnergyUsage.facility_id == fid).count()
        print(f"  {fid}  {profile['name']:<35} {count:>7,} records")
        grand_total += count

    print("=" * 60)
    print(f"  GRAND TOTAL : {grand_total:,} records")
    print(f"  Total time  : {round(time.time() - overall_start, 1)}s")
    print("=" * 60)

    db.close()

if __name__ == "__main__":
    seed_energy_data()
