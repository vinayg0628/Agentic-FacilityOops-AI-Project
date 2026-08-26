import os
import pandas as pd
import numpy as np
import datetime
import uuid
from sqlalchemy.orm import Session
from app.models.facility import Facility
from app.models.energy import EnergyUsage
from app.models.alert import EnergyAlert

# Zone, Visitor, FacilityEvent, SystemAlert models removed from here.
# Proper models now live in:
#   app/models/security_models.py  (Visitor, AccessLog, CCTVEvent, SecurityIncident, SecurityAlert)
#   app/models/occupancy_models.py (Room, OccupancyReading, OccupancyPrediction)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
FACILITIES_CSV = os.path.join(DATA_DIR, "sample_facilities.csv")
ENERGY_CSV = os.path.join(DATA_DIR, "sample_energy_data.csv")
ZONES_CSV = os.path.join(DATA_DIR, "sample_zones.csv")
VISITORS_CSV = os.path.join(DATA_DIR, "sample_visitors.csv")
EVENTS_CSV = os.path.join(DATA_DIR, "sample_events_data.csv")

FACILITY_DEFS = [
    {
        "facility_id": "FAC-001",
        "facility_name": "CyberTech IT Park",
        "facility_type": "IT Park",
        "city": "San Jose",
        "state": "CA",
        "total_floors": 12,
        "total_area_sqft": 450000.0,
        "base_kwh": 320.0
    },
    {
        "facility_id": "FAC-002",
        "facility_name": "St. Jude General Hospital",
        "facility_type": "Hospital",
        "city": "Chicago",
        "state": "IL",
        "total_floors": 8,
        "total_area_sqft": 320000.0,
        "base_kwh": 480.0
    },
    {
        "facility_id": "FAC-003",
        "facility_name": "Pacific Innovation University",
        "facility_type": "University",
        "city": "Seattle",
        "state": "WA",
        "total_floors": 15,
        "total_area_sqft": 600000.0,
        "base_kwh": 400.0
    },
    {
        "facility_id": "FAC-004",
        "facility_name": "Grand Horizon Shopping Mall",
        "facility_type": "Shopping Mall",
        "city": "Dallas",
        "state": "TX",
        "total_floors": 4,
        "total_area_sqft": 520000.0,
        "base_kwh": 350.0
    },
    {
        "facility_id": "FAC-005",
        "facility_name": "Apex Precision Factory",
        "facility_type": "Factory",
        "city": "Detroit",
        "state": "MI",
        "total_floors": 2,
        "total_area_sqft": 280000.0,
        "base_kwh": 550.0
    }
]

def generate_sample_csv_data():
    os.makedirs(DATA_DIR, exist_ok=True)

    # 3. Generate Zones, Visitors, Events if missing
    import random
    import datetime
    now = datetime.datetime.now()
    start_time = now - datetime.timedelta(days=30)
    if not os.path.exists(EVENTS_CSV):
        zones = []
        for fac in FACILITY_DEFS:
            for i in range(3):
                zones.append({
                    "zone_id": f"{fac['facility_id']}-Z{i+1}",
                    "zone_name": f"Zone {i+1}",
                    "zone_type": random.choice(["office", "meeting_room", "common_area", "parking"]),
                    "capacity": random.randint(20, 100),
                    "facility_id": fac['facility_id']
                })
        pd.DataFrame(zones).to_csv(ZONES_CSV, index=False)
        
        visitors = []
        for i in range(10):
            visitors.append({
                "visitor_id": f"V-{i+1}",
                "name": f"Visitor {i+1}",
                "host_employee_id": f"E-{random.randint(1, 50)}",
                "allowed_zones": '["' + random.choice(zones)['zone_id'] + '"]',
                "check_in": start_time.strftime("%Y-%m-%d %H:%M:%S"),
                "check_out": None
            })
        pd.DataFrame(visitors).to_csv(VISITORS_CSV, index=False)
        
        events = []
        curr = start_time
        np.random.seed(43)
        while curr <= now:
            hour = curr.hour
            is_weekend = curr.weekday() >= 5
            
            num_events = 0
            if not is_weekend and 8 <= hour <= 18:
                num_events = random.randint(5, 20)
            else:
                num_events = random.randint(0, 3)
                
            for _ in range(num_events):
                zone = random.choice(zones)
                is_anomaly = (np.random.random() < 0.05)
                entity_type = "employee" if random.random() > 0.1 else "visitor"
                entity_id = f"E-{random.randint(1, 50)}" if entity_type == "employee" else f"V-{random.randint(1, 10)}"
                event_type = random.choice(["badge_swipe", "motion"])
                access_granted = True
                
                if event_type == "badge_swipe":
                    if is_anomaly:
                        access_granted = False
                else:
                    access_granted = None
                
                events.append({
                    "zone_id": zone["zone_id"],
                    "entity_id": entity_id,
                    "entity_type": entity_type,
                    "event_type": event_type,
                    "access_granted": access_granted,
                    "timestamp": curr.strftime("%Y-%m-%d %H:%M:%S")
                })
            
            curr += datetime.timedelta(minutes=15)
            
        pd.DataFrame(events).to_csv(EVENTS_CSV, index=False)

    # 1. Generate Facilities CSV if missing
    if not os.path.exists(FACILITIES_CSV):
        df_fac = pd.DataFrame([
            {k: v for k, v in f.items() if k != 'base_kwh'} for f in FACILITY_DEFS
        ])
        df_fac.to_csv(FACILITIES_CSV, index=False)

    # 2. Generate Energy Usage CSV if missing
    if not os.path.exists(ENERGY_CSV):
        now = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)
        start_time = now - datetime.timedelta(days=30)
        
        records = []
        np.random.seed(42)

        for fac in FACILITY_DEFS:
            fac_id = fac["facility_id"]
            base_kwh = fac["base_kwh"]
            curr = start_time
            
            while curr <= now:
                hour = curr.hour
                is_weekend = curr.weekday() >= 5
                
                # Diurnal business curve
                if 8 <= hour <= 19:
                    hour_multiplier = 1.3 + 0.3 * np.sin((hour - 8) / 11 * np.pi)
                    if is_weekend and fac["facility_type"] in ["IT Park", "Factory"]:
                        hour_multiplier *= 0.5
                else:
                    hour_multiplier = 0.55 if not is_weekend else 0.45

                # Introduce deliberate anomalies for AI Agent detection
                is_spike = (np.random.random() < 0.03)  # 3% chance of anomaly spike
                spike_factor = 1.45 if is_spike else 1.0

                electricity = round(base_kwh * hour_multiplier * (1 + np.random.uniform(-0.08, 0.08)) * spike_factor, 2)
                hvac_ratio = 0.48 + np.random.uniform(-0.05, 0.08)
                if is_spike and np.random.random() > 0.5:
                    hvac_ratio = 0.65  # HVAC Overload anomaly
                
                hvac = round(electricity * hvac_ratio, 2)
                lighting = round(electricity * np.random.uniform(0.18, 0.25), 2)
                
                # Solar generation during daylight hours (07:00 to 18:00)
                solar = 0.0
                if 7 <= hour <= 18:
                    solar_peak = base_kwh * 0.35
                    solar = round(solar_peak * np.sin((hour - 7) / 11 * np.pi) * np.random.uniform(0.85, 1.05), 2)

                water = round(electricity * 2.4 * np.random.uniform(0.85, 1.15), 1)
                
                # Power factor anomaly occasionally
                pf = round(np.random.uniform(0.92, 0.99), 2)
                if np.random.random() < 0.04:
                    pf = round(np.random.uniform(0.82, 0.88), 2)  # Low Power Factor

                temp = round(22.0 + 6.0 * np.sin((hour - 6) / 12 * np.pi) + np.random.uniform(-1.5, 1.5), 1)
                humidity = round(45.0 + np.random.uniform(-10.0, 15.0), 1)

                records.append({
                    "facility_id": fac_id,
                    "timestamp": curr.strftime("%Y-%m-%d %H:%M:%S"),
                    "electricity_kwh": electricity,
                    "water_liters": water,
                    "hvac_kwh": hvac,
                    "lighting_kwh": lighting,
                    "solar_generation_kwh": solar,
                    "power_factor": pf,
                    "temperature": temp,
                    "humidity": humidity
                })
                
                curr += datetime.timedelta(hours=1)

        df_energy = pd.DataFrame(records)
        df_energy.to_csv(ENERGY_CSV, index=False)

def seed_database_from_csv(db: Session):
    generate_sample_csv_data()

    # Seed Facilities if empty
    if db.query(Facility).count() == 0:
        df_fac = pd.read_csv(FACILITIES_CSV)
        for _, row in df_fac.iterrows():
            fac = Facility(
                facility_id=str(row["facility_id"]),
                facility_name=str(row["facility_name"]),
                facility_type=str(row["facility_type"]),
                city=str(row["city"]),
                state=str(row["state"]),
                total_floors=int(row["total_floors"]),
                total_area_sqft=float(row["total_area_sqft"])
            )
            db.add(fac)
        db.commit()

    # Seed Energy Usage if empty
    if db.query(EnergyUsage).count() == 0:
        df_energy = pd.read_csv(ENERGY_CSV)
        records = []
        for _, row in df_energy.iterrows():
            records.append(EnergyUsage(
                facility_id=str(row["facility_id"]),
                timestamp=datetime.datetime.strptime(str(row["timestamp"]), "%Y-%m-%d %H:%M:%S"),
                electricity_kwh=float(row["electricity_kwh"]),
                water_liters=float(row["water_liters"]),
                hvac_kwh=float(row["hvac_kwh"]),
                lighting_kwh=float(row["lighting_kwh"]),
                solar_generation_kwh=float(row["solar_generation_kwh"]),
                power_factor=float(row["power_factor"]),
                temperature=float(row["temperature"]),
                humidity=float(row["humidity"])
            ))
        db.bulk_save_objects(records)
        db.commit()

    # NOTE: Zone, Visitor, and FacilityEvent CSV seeding removed.
    # Occupancy and Security data is now seeded by seed_occupancy_security_data() in main.py startup.

