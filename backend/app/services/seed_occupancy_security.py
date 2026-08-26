"""Seed realistic occupancy and security data for Milestone 3."""
import random, uuid, datetime, logging
from sqlalchemy.orm import Session
logger = logging.getLogger('facilityops.seed_occ_sec')

FACILITY_IDS = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005']
ROOM_TYPES = ['Office', 'Meeting Room', 'Conference Room', 'Common Area',
              'Cafeteria', 'Lobby', 'Server Room', 'Laboratory', 'Classroom', 'Parking Area']
ACCESS_METHODS = ['Card', 'RFID', 'PIN', 'Biometric', 'QR']
CCTV_EVENTS_LIST = [
    'Person Detected', 'Multiple People Detected', 'Motion Detected',
    'Restricted Area Entry', 'Loitering', 'Tailgating Suspected',
    'Door Forced', 'Object Detected'
]
INCIDENT_TYPES = [
    'Unauthorized Access', 'Repeated Failed Access', 'Restricted Zone Breach',
    'After-Hours Activity', 'Tailgating Detected', 'Door Forced Open', 'Suspicious Movement'
]
FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry',
               'Iris', 'Jack', 'Karen', 'Leo', 'Mary', 'Nathan', 'Olivia']
LAST_NAMES = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson']


def _random_name():
    return f'{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}'


def seed_occupancy_security_data(db: Session) -> None:
    from app.models.occupancy_models import Room, OccupancyReading, OccupancyPrediction
    from app.models.security_models import AccessLog, Visitor, CCTVEvent, SecurityIncident, SecurityAlert

    if db.query(Room).count() > 0:
        logger.info('Occupancy/Security data already seeded.')
        return

    logger.info('Seeding Occupancy & Security data...')
    random.seed(2024)
    now = datetime.datetime.utcnow()

    # ── 1. Rooms
    rooms = []
    room_map = {}
    for fac in FACILITY_IDS:
        room_map[fac] = []
        for floor in range(1, 4):
            for idx in range(3):
                rt = ROOM_TYPES[(floor * 3 + idx) % len(ROOM_TYPES)]
                capacity = random.choice([15, 20, 30, 40, 50, 80, 100])
                if rt in ('Conference Room', 'Cafeteria', 'Lobby'):
                    capacity = random.choice([50, 80, 100, 150])
                r = Room(
                    room_id=f'{fac}-F{floor}-R{idx+1}',
                    facility_id=fac,
                    floor=floor,
                    room_name=f'Floor {floor} {rt} {idx+1}',
                    room_type=rt,
                    capacity=capacity,
                    area_sqft=float(capacity * random.randint(10, 20)),
                    zone=f'Floor-{floor}',
                    status='active',
                )
                rooms.append(r)
                room_map[fac].append(r)
    db.add_all(rooms)
    db.flush()
    logger.info('  Rooms: %d created', len(rooms))

    # ── 2. OccupancyReadings (hourly, 7 days)
    readings = []
    t = now - datetime.timedelta(days=7)
    while t <= now:
        hr = t.hour
        is_weekend = t.weekday() >= 5
        if 0 <= hr < 7: base = 0.05
        elif 7 <= hr < 9: base = 0.35
        elif 9 <= hr < 12: base = 0.70
        elif 12 <= hr < 14: base = 0.80
        elif 14 <= hr < 18: base = 0.65
        elif 18 <= hr < 21: base = 0.30
        else: base = 0.10
        if is_weekend: base *= 0.25
        for fac in FACILITY_IDS:
            for room in room_map[fac]:
                rate = min(1.1, max(0.0, base + random.gauss(0, 0.1)))
                count = min(room.capacity + 2, max(0, int(rate * room.capacity)))
                readings.append(OccupancyReading(
                    facility_id=fac,
                    room_id=room.room_id,
                    floor=room.floor,
                    timestamp=t,
                    people_count=count,
                    entry_count=max(0, count - random.randint(0, 2)),
                    exit_count=random.randint(0, max(1, count // 4)),
                    capacity=room.capacity,
                    occupancy_rate=round(count / room.capacity, 4),
                ))
        t += datetime.timedelta(hours=1)
    for i in range(0, len(readings), 500):
        db.bulk_save_objects(readings[i:i+500])
    db.flush()
    logger.info('  OccupancyReadings: %d created', len(readings))

    # ── 3. AccessLogs (7 days)
    access_logs = []
    for fac in FACILITY_IDS:
        t = now - datetime.timedelta(days=7)
        while t <= now:
            for _ in range(random.randint(60, 150)):
                offset = random.randint(0, 1439)
                ts = t + datetime.timedelta(minutes=offset)
                hr = ts.hour
                after_hours = hr < 6 or hr >= 22
                denied = random.random() < (0.15 if after_hours else 0.04)
                zones = [f'{fac}-Floor1', f'{fac}-Floor2', f'{fac}-Floor3']
                access_logs.append(AccessLog(
                    facility_id=fac,
                    zone_id=random.choice(zones),
                    user_id=f'USR-{random.randint(1000, 9999)}',
                    user_type=random.choice(['Employee', 'Employee', 'Employee', 'Contractor', 'Visitor']),
                    timestamp=ts,
                    access_method=random.choice(ACCESS_METHODS),
                    direction=random.choice(['Entry', 'Exit']),
                    result='Denied' if denied else 'Allowed',
                    reason='Unauthorized' if denied else None,
                ))
            t += datetime.timedelta(days=1)
    # Demo anomaly: 3 failures in 5 min
    base_ts = now - datetime.timedelta(hours=2)
    for i in range(3):
        access_logs.append(AccessLog(
            facility_id='FAC-001',
            zone_id='FAC-001-Floor2',
            user_id='USR-ANML-001',
            user_type='Unknown',
            timestamp=base_ts + datetime.timedelta(minutes=i * 2),
            access_method='Card',
            direction='Entry',
            result='Denied',
            reason='Repeated Failure',
        ))
    for i in range(0, len(access_logs), 500):
        db.bulk_save_objects(access_logs[i:i+500])
    db.flush()
    logger.info('  AccessLogs: %d created', len(access_logs))

    # ── 4. Visitors — with allowed_zones for zone-violation tracking
    import json as _json
    visitors = []
    for fac in FACILITY_IDS:
        for d in range(7):
            for _ in range(random.randint(3, 8)):
                ci = (now - datetime.timedelta(days=d)).replace(
                    hour=random.randint(8, 17), minute=random.randint(0, 59), second=0, microsecond=0)
                co = ci + datetime.timedelta(hours=random.randint(1, 4)) if random.random() > 0.25 else None
                allowed_floor = random.randint(1, 3)
                allowed_zones_list = [f'{fac}-Floor{allowed_floor}']
                current_floor = random.randint(1, 3)
                current_zone = f'{fac}-Floor{current_floor}'
                visitors.append(Visitor(
                    visitor_id=f'VIS-{fac}-{uuid.uuid4().hex[:8]}',
                    facility_id=fac,
                    visitor_name=_random_name(),
                    visitor_type=random.choice(['Business', 'Contractor', 'Delivery', 'VIP']),
                    host_employee=f'EMP-{random.randint(100, 999)}',
                    check_in_time=ci,
                    check_out_time=co,
                    badge_id=f'B-{random.randint(1000, 9999)}',
                    current_zone=current_zone,
                    allowed_zones=_json.dumps(allowed_zones_list),
                    status='checked_out' if co else 'active',
                ))
    db.bulk_save_objects(visitors)
    db.flush()
    logger.info('  Visitors: %d created', len(visitors))

    # ── 5. CCTV Events
    cctv_evts = []
    for fac in FACILITY_IDS:
        for d in range(7):
            for _ in range(random.randint(15, 40)):
                ts = (now - datetime.timedelta(days=d)).replace(
                    hour=random.randint(0, 23), minute=random.randint(0, 59), second=0, microsecond=0)
                et = random.choices(
                    CCTV_EVENTS_LIST,
                    weights=[30, 15, 20, 5, 8, 5, 3, 14], k=1)[0]
                sev = 'High' if et in ('Door Forced', 'Tailgating Suspected', 'Restricted Area Entry') else 'Low'
                cctv_evts.append(CCTVEvent(
                    facility_id=fac,
                    camera_id=f'CAM-{fac}-{random.randint(1,10):02d}',
                    zone_id=f'{fac}-Floor{random.randint(1,3)}',
                    timestamp=ts,
                    event_type=et,
                    person_count=random.randint(1, 4),
                    confidence=round(random.uniform(0.75, 0.99), 2),
                    severity=sev,
                ))
    db.bulk_save_objects(cctv_evts)
    db.flush()
    logger.info('  CCTVEvents: %d created', len(cctv_evts))

    # ── 6. SecurityIncidents
    incidents = []
    statuses = ['Open', 'Investigating', 'Contained', 'Resolved', 'False Positive']
    for fac in FACILITY_IDS:
        for _ in range(random.randint(4, 8)):
            ts = now - datetime.timedelta(
                days=random.randint(0, 6),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )
            risk_score = round(random.uniform(35, 95), 1)
            itype = random.choice(INCIDENT_TYPES)
            sev = 'Critical' if risk_score > 80 else ('High' if risk_score > 60 else 'Medium')
            status = random.choices(statuses, weights=[3, 2, 1, 3, 1], k=1)[0]
            incidents.append(SecurityIncident(
                facility_id=fac,
                zone_id=f'{fac}-Floor{random.randint(1,3)}',
                timestamp=ts,
                incident_type=itype,
                severity=sev,
                risk_score=risk_score,
                description=f'{itype} detected at {fac}. Immediate review required.',
                recommended_action='Review access logs and CCTV footage. Notify security team.',
                investigation_status=status,
                assigned_to=random.choice(['Security Team', 'Facility Manager', None]),
                resolved_at=ts + datetime.timedelta(hours=random.randint(1, 12)) if status in ('Resolved', 'False Positive') else None,
            ))
    db.bulk_save_objects(incidents)
    db.flush()
    logger.info('  SecurityIncidents: %d created', len(incidents))

    # ── 7. SecurityAlerts
    alerts = []
    alert_types = [
        'Unauthorized Access', 'Repeated Failed Login', 'Restricted Zone Access',
        'After-Hours Activity', 'Tailgating Suspected', 'Door Forced Open', 'Multiple Failed Access'
    ]
    for fac in FACILITY_IDS:
        for _ in range(random.randint(3, 7)):
            ts = now - datetime.timedelta(hours=random.randint(0, 48))
            risk_score = round(random.uniform(31, 95), 1)
            at = random.choice(alert_types)
            sev = 'Critical' if risk_score > 80 else ('High' if risk_score > 60 else 'Medium')
            alerts.append(SecurityAlert(
                facility_id=fac,
                zone_id=f'{fac}-Floor{random.randint(1,3)}',
                timestamp=ts,
                alert_type=at,
                severity=sev,
                risk_score=risk_score,
                message=f'{at} detected in {fac}. Risk score: {risk_score}. Review immediately.',
                recommended_action='Review CCTV footage and notify security supervisor.',
                status=random.choice(['Open', 'Open', 'Acknowledged', 'Resolved']),
            ))
    db.bulk_save_objects(alerts)
    db.commit()
    logger.info('  SecurityAlerts: %d created', len(alerts))
    logger.info('Occupancy & Security seeding complete.')