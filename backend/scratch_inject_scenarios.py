import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import datetime
from app.core.database import SessionLocal
from app.models.occupancy_models import Room, OccupancyReading, OccupancyEvent
from app.models.security_models import AccessLog, CCTVEvent

def inject():
    db = SessionLocal()
    now = datetime.datetime.utcnow()
    
    # 1. GHOST MOTION on Floor 3
    r3 = db.query(Room).filter_by(facility_id='FAC-001', floor=3).first()
    if r3:
        db.add(OccupancyReading(
            facility_id='FAC-001', room_id=r3.room_id, floor=3,
            timestamp=now - datetime.timedelta(minutes=10),
            people_count=0, occupancy_rate=0.0
        ))
        db.add(CCTVEvent(
            facility_id='FAC-001', camera_id='CAM-F3-01', zone_id='FAC-001-Floor3',
            timestamp=now - datetime.timedelta(minutes=9),
            event_type='Motion Detected', person_count=1, severity='High'
        ))
    
    # 2. TAILGATING on Floor 1
    r1 = db.query(Room).filter_by(facility_id='FAC-001', floor=1).first()
    if r1:
        db.add(AccessLog(
            facility_id='FAC-001', zone_id='FAC-001-Floor1', user_id='EMP101',
            timestamp=now - datetime.timedelta(minutes=20),
            access_method='Card', direction='Entry', result='Allowed'
        ))
        db.add(OccupancyEvent(
            facility_id='FAC-001', room_id=r1.room_id, floor=1,
            timestamp=now - datetime.timedelta(minutes=19),
            direction='in', source='counter', entity_id='unknown'
        ))
        db.add(OccupancyReading(
            facility_id='FAC-001', room_id=r1.room_id, floor=1,
            timestamp=now - datetime.timedelta(minutes=19),
            people_count=12, entry_count=3
        ))
        db.add(CCTVEvent(
            facility_id='FAC-001', camera_id='CAM-F1-01', zone_id='FAC-001-Floor1',
            timestamp=now - datetime.timedelta(minutes=19),
            event_type='Multiple People Detected', person_count=4, severity='Medium'
        ))
        
    db.commit()
    print("Scenarios injected successfully!")

if __name__ == '__main__':
    inject()
