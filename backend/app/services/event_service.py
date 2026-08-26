"""In-memory cross-agent event bus for the Intelligence Engine."""
import uuid
import logging
from datetime import datetime
from typing import List, Optional

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


class EventService:
    """Ring-buffer in-memory event store."""

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
            'timestamp': datetime.utcnow().isoformat(),
            'data': data,
        }
        self._events.append(event)
        if len(self._events) > self._max_events:
            self._events = self._events[-self._max_events:]
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
        cutoff = datetime.utcnow().timestamp() - (minutes * 60)
        return [e for e in self._events
                if datetime.fromisoformat(e['timestamp']).timestamp() >= cutoff]

    def clear(self):
        self._events = []


event_service = EventService()