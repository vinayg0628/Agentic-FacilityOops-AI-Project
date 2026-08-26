"""Intelligence Engine: cross-agent reasoning and scenario detection."""
import logging, uuid, datetime
from sqlalchemy.orm import Session
from app.services.event_service import event_service
from app.models.occupancy_models import Room, OccupancyReading, OccupancyEvent
from app.models.security_models import AccessLog, CCTVEvent

logger = logging.getLogger('facilityops.intelligence_engine')
FACILITY_IDS = ['FAC-001', 'FAC-002', 'FAC-003', 'FAC-004', 'FAC-005']

class IntelligenceEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_insights(self, facility_id: str = None):
        facilities = [facility_id] if facility_id else FACILITY_IDS
        insights = []
        for fac in facilities:
            insights += self._scenario_ghost_motion(fac)
            insights += self._scenario_tailgating_mismatch(fac)
            
            # Add existing baseline scenarios
            insights += self._scenario_low_occupancy_high_energy(fac)
            insights += self._scenario_after_hours_activity(fac)
            insights += self._scenario_high_occupancy_hvac_stress(fac)
        return insights

    def _make_insight(self, scenario, facility_id, severity, title, description, agents, action):
        return {
            'insight_id': str(uuid.uuid4())[:8],
            'scenario': scenario,
            'facility_id': facility_id,
            'severity': severity,
            'title': title,
            'description': description,
            'agents_involved': agents,
            'recommended_action': action,
            'timestamp': datetime.datetime.utcnow().isoformat(),
        }

    def _scenario_ghost_motion(self, facility_id: str):
        """
        Scenario: Occupancy is 0 on a floor, but CCTV detects motion.
        Result: HIGH SECURITY RISK.
        """
        insights = []
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
        
        # 1. Find floors/zones where occupancy is exactly 0 recently
        recent_occ = (
            self.db.query(OccupancyReading)
            .filter(OccupancyReading.facility_id == facility_id)
            .filter(OccupancyReading.timestamp >= cutoff)
            .all()
        )
        # Check by floor
        zero_occ_floors = set()
        for r in recent_occ:
            if r.people_count == 0:
                zero_occ_floors.add(r.floor)
                
        if not zero_occ_floors:
            return []
            
        # 2. Check CCTV events for those floors
        recent_cctv = (
            self.db.query(CCTVEvent)
            .filter(CCTVEvent.facility_id == facility_id)
            .filter(CCTVEvent.timestamp >= cutoff)
            .filter(CCTVEvent.event_type.in_(['Motion Detected', 'Person Detected']))
            .all()
        )
        
        for event in recent_cctv:
            # Simple heuristic to extract floor from zone_id e.g. "FAC-001-Floor3"
            for floor in zero_occ_floors:
                floor_str = f"Floor{floor}"
                if floor_str in event.zone_id:
                    insight = self._make_insight(
                        scenario='ghost_motion',
                        facility_id=facility_id,
                        severity='CRITICAL',
                        title='Ghost Motion: Movement in Empty Zone',
                        description=f'Unexpected movement detected in {event.zone_id}. '
                                    'Occupancy sensors report 0 people in this restricted area.',
                        agents=['occupancy', 'security'],
                        action='Trigger lockdown for the zone and dispatch security personnel immediately.'
                    )
                    event_service.publish(facility_id=facility_id, agent='intelligence',
                        event_type='CROSS_AGENT_ALERT', severity='CRITICAL', data=insight)
                    insights.append(insight)
                    break # Avoid duplicate insights for same event
        return insights

    def _scenario_tailgating_mismatch(self, facility_id: str):
        """
        Scenario: 1 person swiped card, but Occupancy or CCTV detected > 1 person.
        Result: Tailgating detected -> Raise risk score.
        """
        insights = []
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
        
        # 1. Find recent successful access logs
        recent_access = (
            self.db.query(AccessLog)
            .filter(AccessLog.facility_id == facility_id, AccessLog.result == 'Allowed', AccessLog.timestamp >= cutoff)
            .all()
        )
        if not recent_access:
            return []
            
        # For simplicity, let's group by 5-min windows or just check nearby events
        for acc in recent_access:
            acc_time = acc.timestamp
            t_start = acc_time - datetime.timedelta(minutes=2)
            t_end = acc_time + datetime.timedelta(minutes=2)
            
            # Check CCTV counts nearby
            cctv_events = (
                self.db.query(CCTVEvent)
                .filter(CCTVEvent.facility_id == facility_id, CCTVEvent.zone_id == acc.zone_id)
                .filter(CCTVEvent.timestamp.between(t_start, t_end))
                .all()
            )
            cctv_tailgate = any(c.person_count > 1 or 'Multiple' in c.event_type for c in cctv_events)
            
            # Check Occupancy Entry spikes (assume room matches zone floor)
            # Find matching floor from zone
            floor_val = None
            if 'Floor1' in acc.zone_id: floor_val = 1
            elif 'Floor2' in acc.zone_id: floor_val = 2
            elif 'Floor3' in acc.zone_id: floor_val = 3
            
            occ_spike = False
            if floor_val:
                occ_readings = (
                    self.db.query(OccupancyReading)
                    .filter(OccupancyReading.facility_id == facility_id, OccupancyReading.floor == floor_val)
                    .filter(OccupancyReading.timestamp.between(t_start, t_end))
                    .all()
                )
                occ_spike = any(r.entry_count > 1 for r in occ_readings)
                
            if cctv_tailgate or occ_spike:
                desc_parts = []
                if occ_spike: desc_parts.append('Occupancy sensor recorded multiple entries.')
                if cctv_tailgate: desc_parts.append('CCTV detected multiple people.')
                
                insight = self._make_insight(
                    scenario='tailgating_mismatch',
                    facility_id=facility_id,
                    severity='HIGH',
                    title='Inconsistent Entry: Tailgating Suspected',
                    description=f'Single access card swipe recorded for {acc.user_id}, but physical sensors '
                                f'indicate multiple people entered {acc.zone_id}. ' + " ".join(desc_parts),
                    agents=['occupancy', 'security'],
                    action='Flag user for security review. Raise risk score for the current zone.'
                )
                event_service.publish(facility_id=facility_id, agent='intelligence',
                    event_type='CROSS_AGENT_ALERT', severity='HIGH', data=insight)
                insights.append(insight)
                break  # Return just one tailgating alert per run for simplicity
                
        return insights


    # ---------------------------------------------------------
    # Baseline existing scenarios
    # ---------------------------------------------------------

    def _scenario_low_occupancy_high_energy(self, facility_id: str):
        events = event_service.get_events(facility_id=facility_id)
        has_low_occ = any(e['event_type'] == 'LOW_OCCUPANCY' for e in events)
        has_high_energy = any(e['event_type'] == 'HIGH_ENERGY' for e in events)
        if has_low_occ and has_high_energy:
            insight = self._make_insight(
                'low_occupancy_high_energy', facility_id, 'HIGH',
                'Low Occupancy + High Energy Consumption',
                f'Facility {facility_id} has low occupancy but unusually high energy consumption. '
                'HVAC and lighting may be running unnecessarily in unoccupied zones.',
                ['occupancy', 'energy'],
                'Reduce HVAC and lighting loads in zones with <20% occupancy. Estimated savings: 20-35%.',
            )
            event_service.publish(facility_id=facility_id, agent='intelligence',
                event_type='CROSS_AGENT_ALERT', severity='HIGH', data=insight)
            return [insight]
        return []

    def _scenario_after_hours_activity(self, facility_id: str):
        events = event_service.get_events(facility_id=facility_id)
        has_after_hours = any(e['event_type'] in ('AFTER_HOURS_ACTIVITY', 'UNAUTHORIZED_ACCESS') for e in events)
        has_low_occ = any(e['event_type'] == 'LOW_OCCUPANCY' for e in events)
        if has_after_hours or has_low_occ:
            cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=8)
            after_hours_logs = (
                self.db.query(AccessLog)
                .filter(
                    AccessLog.facility_id == facility_id,
                    AccessLog.result == 'Denied',
                    AccessLog.timestamp >= cutoff,
                ).count()
            )
            if after_hours_logs > 2:
                insight = self._make_insight(
                    'after_hours_security', facility_id, 'CRITICAL',
                    'Suspicious After-Hours Activity Detected',
                    f'Multiple denied access attempts in {facility_id} during off-hours. '
                    'Occupancy sensors show low or no presence, yet access attempts continue.',
                    ['security', 'occupancy'],
                    'Dispatch security personnel. Review CCTV footage. Lock down affected zones.',
                )
                event_service.publish(facility_id=facility_id, agent='intelligence',
                    event_type='CROSS_AGENT_ALERT', severity='CRITICAL', data=insight)
                return [insight]
        return []

    def _scenario_high_occupancy_hvac_stress(self, facility_id: str):
        events = event_service.get_events(facility_id=facility_id)
        has_peak = any(e['event_type'] in ('PEAK_OCCUPANCY', 'OVERCROWDING') for e in events)
        has_maint = any(e['event_type'] in ('EQUIPMENT_HEALTH_LOW', 'MAINTENANCE_REQUIRED') for e in events)
        if has_peak and has_maint:
            insight = self._make_insight(
                'high_occupancy_hvac_stress', facility_id, 'HIGH',
                'High Occupancy + HVAC Under Stress',
                f'Facility {facility_id} is at peak occupancy while HVAC health is degrading. '
                'Sustained thermal load may accelerate equipment failure.',
                ['occupancy', 'maintenance'],
                'Schedule preventive HVAC inspection. Consider temporary cooling units for high-density zones.',
            )
            event_service.publish(facility_id=facility_id, agent='intelligence',
                event_type='CROSS_AGENT_ALERT', severity='HIGH', data=insight)
            return [insight]
        return []

    def get_recommendations(self, facility_id: str = None):
        insights = self.get_insights(facility_id)
        recs = []
        # deduplicate insights by title to avoid UI clutter
        seen_titles = set()
        for ins in insights:
            if ins['title'] in seen_titles:
                continue
            seen_titles.add(ins['title'])
            recs.append({
                'recommendation_id': ins['insight_id'],
                'source': 'Intelligence Engine',
                'agents_involved': ins['agents_involved'],
                'priority': ins['severity'],
                'title': ins['title'],
                'description': ins['description'],
                'action': ins['recommended_action'],
                'facility_id': ins['facility_id'],
                'timestamp': ins['timestamp'],
            })
        return recs