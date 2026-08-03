import random
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.equipment import Equipment, MaintenanceMonitoring, MaintenanceAlert, MaintenanceSchedule

logger = logging.getLogger(__name__)

def seed_maintenance_data(db: Session) -> None:
    """Seed the database with sample predictive maintenance data."""
    if db.query(Equipment).first():
        logger.info('Maintenance data already seeded.')
        return

    facilities = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005']
    equipment_templates = [
        {'type': 'HVAC', 'prefix': 'HVAC Unit-A Floor'},
        {'type': 'HVAC', 'prefix': 'HVAC Unit-B Floor'},
        {'type': 'Generator', 'prefix': 'Main Generator G-0'},
        {'type': 'Water Pump', 'prefix': 'Water Pump WP-0'},
        {'type': 'Elevator', 'prefix': 'Passenger Elevator E-0'},
        {'type': 'UPS', 'prefix': 'Central UPS-0'},
        {'type': 'Transformer', 'prefix': 'Transformer T-0'},
        {'type': 'Chiller', 'prefix': 'Primary Chiller CH-0'},
        {'type': 'Air Compressor', 'prefix': 'Air Compressor AC-0'},
        {'type': 'Lighting Panel', 'prefix': 'Main Lighting Panel LP-0'}
    ]
    
    manufacturers = ['Carrier', 'Caterpillar', 'Grundfos', 'Otis', 'Eaton', 'Siemens', 'Trane', 'Atlas Copco', 'Philips', 'SMA Solar']
    locations = ['Mechanical Room B1', 'Rooftop Plant Room', 'Basement Level 2', 'Ground Floor Core', 'Utility Shaft']
    
    total_equipments = 0
    now = datetime.utcnow()
    random.seed(42)  # For reproducible sample data
    
    for fac in facilities:
        for i, t in enumerate(equipment_templates):
            eq_name = f"{t['prefix']}{i+1}"
            eq_type = t['type']
            
            eq = Equipment(
                facility_id=fac,
                equipment_name=eq_name,
                equipment_type=eq_type,
                manufacturer=random.choice(manufacturers),
                installation_date=now - timedelta(days=random.randint(365, 365*8)),
                expected_life_years=random.randint(10, 20),
                location=random.choice(locations),
                status=random.choices(['Operational', 'Under Maintenance'], weights=[90, 10])[0]
            )
            db.add(eq)
            db.commit()
            db.refresh(eq)
            total_equipments += 1
            
            # 720 Monitoring Records (30 days)
            records = []
            base_temp = 25.0 if eq_type != 'Generator' else 75.0
            base_vib = 1.0 if eq_type != 'HVAC' else 2.5
            runtime = float(random.randint(1000, 5000))
            base_power = 100.0
            
            for h in range(720):
                ts = now - timedelta(hours=720-h)
                runtime += 1.0
                
                temp = base_temp + random.uniform(-5, 5)
                if random.random() < 0.02: temp += random.uniform(10, 20)  # Spike
                
                vib = base_vib + random.uniform(-0.5, 0.5)
                if random.random() < 0.02: vib += random.uniform(2, 4)     # Spike
                
                rec = MaintenanceMonitoring(
                    equipment_id=eq.equipment_id,
                    timestamp=ts,
                    temperature=temp,
                    vibration=max(0, vib),
                    runtime_hours=runtime,
                    pressure=random.uniform(2.0, 5.0),
                    humidity=random.uniform(40, 75),
                    power_consumption=base_power * random.uniform(0.85, 1.15),
                    operating_status=random.choices(['Running', 'Idle', 'Fault'], weights=[85, 14, 1])[0]
                )
                records.append(rec)
            db.add_all(records)
            
            # Alerts
            for _ in range(random.randint(1, 4)):
                alert = MaintenanceAlert(
                    equipment_id=eq.equipment_id,
                    timestamp=now - timedelta(days=random.randint(0, 15)),
                    severity=random.choices(['Critical', 'High', 'Medium', 'Low'], weights=[5, 20, 50, 25])[0],
                    issue=f'Detected anomaly in {eq_type} operation metrics',
                    recommendation='Inspect system components and verify operation',
                    status=random.choice(['Open', 'Acknowledged', 'Resolved'])
                )
                db.add(alert)
                
            # Schedules
            for _ in range(random.randint(2, 3)):
                days_offset = random.randint(-15, 90)
                sched = MaintenanceSchedule(
                    equipment_id=eq.equipment_id,
                    next_service_date=now + timedelta(days=days_offset),
                    maintenance_type=random.choice(['Preventive', 'Corrective', 'Predictive', 'Emergency']),
                    priority=random.choice(['Critical', 'High', 'Medium', 'Low']),
                    assigned_engineer=f'Engineer-{random.randint(1, 10)}',
                    status='Overdue' if days_offset < 0 else random.choice(['Scheduled', 'In Progress']),
                    estimated_duration_hours=random.uniform(1.0, 8.0),
                    estimated_cost_usd=random.uniform(200, 2500)
                )
                db.add(sched)
                
    db.commit()
    logger.info(f'Maintenance data seeding complete. Created {total_equipments} equipment records.')
