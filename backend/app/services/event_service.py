import uuid
import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.event_models import AgentEvent
from app.core.database import SessionLocal

logger = logging.getLogger('facilityops.event_service')

class EventType:
    HIGH_ENERGY = 'HIGH_ENERGY'
    LOW_ENERGY = 'LOW_ENERGY'
    HVAC_OVERLOAD = 'HVAC_OVERLOAD'
    POWER_FACTOR_LOW = 'POWER_FACTOR_LOW'
    EQUIPMENT_HEALTH_LOW = 'EQUIPMENT_HEALTH_LOW'
    MAINTENANCE_REQUIRED = 'MAINTENANCE_REQUIRED'
    EQUIPMENT_FAULT = 'EQUIPMENT_FAULT'
    OVERCROWDING = 'OVERCROWDING'
    LOW_OCCUPANCY = 'LOW_OCCUPANCY'
    PEAK_OCCUPANCY = 'PEAK_OCCUPANCY'
    NORMAL_OCCUPANCY = 'NORMAL_OCCUPANCY'
    UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS'
    REPEATED_FAILURES = 'REPEATED_FAILURES'
    RESTRICTED_ZONE_ACCESS = 'RESTRICTED_ZONE_ACCESS'
    AFTER_HOURS_ACTIVITY = 'AFTER_HOURS_ACTIVITY'
    TAILGATING_SUSPECTED = 'TAILGATING_SUSPECTED'
    VISITOR_ANOMALY = 'VISITOR_ANOMALY'
    DOOR_FORCED = 'DOOR_FORCED'
    CROSS_AGENT_ALERT = 'CROSS_AGENT_ALERT'
    COMBINED_RECOMMENDATION = 'COMBINED_RECOMMENDATION'
    # Cost agent specific
    HIGH_HVAC_COST = 'HIGH_HVAC_COST'
    BUDGET_OVERRUN = 'BUDGET_OVERRUN'
    HIGH_FAILURE_PROBABILITY = 'HIGH_FAILURE_PROBABILITY'
    SECURITY_INCIDENT = 'SECURITY_INCIDENT'
    TAILGATING = 'TAILGATING'

class EventService:
    """Ring-buffer in-memory event store with DB persistence for Milestone 4."""

    def __init__(self, max_events: int = 2000):
        self._events: List[dict] = []
        self._max_events = max_events

    def publish(self, facility_id: str, agent: str, event_type: str, severity: str, data: dict) -> dict:
        event = {
            'event_id': str(uuid.uuid4()),
            'facility_id': facility_id,
            'agent': agent,
            'event_type': event_type,
            'severity': severity,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'data': data,
        }
        self._events.append(event)
        if len(self._events) > self._max_events:
            self._events = self._events[-self._max_events:]
            
        try:
            db = SessionLocal()
            db_event = AgentEvent(
                event_id=event['event_id'],
                facility_id=facility_id,
                agent=agent,
                event_type=event_type,
                severity=severity,
                timestamp=datetime.fromisoformat(event['timestamp']),
                data=data
            )
            db.add(db_event)
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"Failed to persist event to DB: {e}")

        logger.debug('Event published: %s | %s | %s', agent, event_type, facility_id)
        return event

    def get_events(self, facility_id: Optional[str] = None, agent: Optional[str] = None,
                   event_type: Optional[str] = None, limit: int = 200) -> List[dict]:
        events = self._events
        if facility_id:
            events = [e for e in events if e['facility_id'] == facility_id]
        if agent:
            events = [e for e in events if e['agent'] == agent]
        if event_type:
            events = [e for e in events if e['event_type'] == event_type]
        return events[-limit:]

    def get_recent_events(self, minutes: int = 60) -> List[dict]:
        cutoff = datetime.now(timezone.utc).timestamp() - (minutes * 60)
        return [e for e in self._events
                if datetime.fromisoformat(e['timestamp']).timestamp() >= cutoff]

    def clear(self):
        self._events = []

event_service = EventService()