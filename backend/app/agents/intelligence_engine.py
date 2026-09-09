import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.event_models import AgentEvent, AgentInsight
from app.models.cost_models import OptimizationOpportunity, CostRecord

logger = logging.getLogger(__name__)

class IntelligenceEngine:
    """
    Cross-Agent Orchestration Layer (Milestone 4).
    Receives structured events, applies rules, coordinates across agents,
    and generates unified recommendations (AgentInsight).
    """

    def __init__(self, db: Session):
        self.db = db

    def _get_recent_events(self, facility_id: str, hours: int = 24):
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        return self.db.query(AgentEvent).filter(
            AgentEvent.facility_id == facility_id,
            AgentEvent.timestamp >= cutoff
        ).all()

    def run_orchestration(self, facility_id: str):
        logger.info(f"IntelligenceEngine running for facility: {facility_id}")
        events = self._get_recent_events(facility_id, hours=48)
        
        # Categorize events by agent
        energy_events = [e for e in events if e.agent == 'energy']
        maint_events = [e for e in events if e.agent == 'maintenance']
        occ_events = [e for e in events if e.agent == 'occupancy']
        sec_events = [e for e in events if e.agent == 'security']
        cost_events = [e for e in events if e.agent == 'cost']

        # Helpers to check specific event existence
        has_high_hvac_energy = any(e.event_type == 'HVAC_OVERLOAD' or e.event_type == 'HIGH_HVAC_CONSUMPTION' for e in energy_events)
        has_high_hvac_cost = any(e.event_type == 'HIGH_HVAC_COST' for e in cost_events)
        has_high_failure_prob = any(e.severity in ['HIGH', 'CRITICAL'] and 'failure' in str(e.data).lower() for e in maint_events)
        has_emergency_repair_cost = any(e.event_type == 'EMERGENCY_REPAIR' for e in maint_events)
        has_low_occ = any(e.event_type == 'LOW_OCCUPANCY' for e in occ_events)
        has_high_energy = any(e.event_type == 'HIGH_ENERGY' for e in energy_events)
        has_high_cost = len(cost_events) > 0 # any cost event implies cost concern
        has_rising_sec_issues = any(e.event_type == 'UNAUTHORIZED_ACCESS' for e in sec_events)
        has_rising_sec_cost = any(e.event_type == 'SECURITY_INCIDENT_COST' for e in cost_events)
        has_high_occ = any(e.event_type == 'PEAK_OCCUPANCY' or e.event_type == 'OVERCROWDING' for e in occ_events)
        has_poor_hvac_health = any('hvac' in str(e.data).lower() for e in maint_events)
        has_no_sec_issue = len(sec_events) == 0

        insights = []

        # Scenario A: High HVAC energy % + high HVAC cost
        if has_high_hvac_energy and has_high_hvac_cost:
            insights.append(AgentInsight(
                facility_id=facility_id,
                title="HVAC Energy & Cost Optimization",
                description="Detected high HVAC usage coupled with elevated HVAC costs.",
                severity="HIGH",
                agents_involved=["energy", "cost"],
                recommended_action="Reduce HVAC operation during low-occupancy periods to reduce monthly energy expenditure.",
                estimated_savings=85000.0
            ))

        # Scenario B: High failure probability + high emergency repair cost estimate
        if has_high_failure_prob and has_emergency_repair_cost:
            insights.append(AgentInsight(
                facility_id=facility_id,
                title="Preventive Maintenance ROI",
                description="High equipment failure probability matching historical emergency repair spikes.",
                severity="CRITICAL",
                agents_involved=["maintenance", "cost"],
                recommended_action="Perform preventive maintenance now to avoid a potential ₹2.5L emergency repair.",
                estimated_savings=210000.0 # Avoided cost (2.5L - 40k)
            ))

        # Scenario C: Low occupancy + high energy + high cost
        if has_low_occ and has_high_energy and has_high_cost:
            insights.append(AgentInsight(
                facility_id=facility_id,
                title="Workspace Consolidation",
                description="Zone showing low occupancy but high energy consumption and cost.",
                severity="MEDIUM",
                agents_involved=["occupancy", "energy", "cost"],
                recommended_action="Consolidate low-occupancy operations and reduce HVAC/lighting operation during unused periods.",
                estimated_savings=45000.0
            ))

        # Scenario D: Rising unauthorized access + rising security staffing cost
        if has_rising_sec_issues and has_rising_sec_cost:
            insights.append(AgentInsight(
                facility_id=facility_id,
                title="Security Staffing Inefficiency",
                description="Unauthorized access increasing while security costs rise.",
                severity="HIGH",
                agents_involved=["security", "cost"],
                recommended_action="Security incidents are increasing. Before expanding staffing, investigate access-control failures and improve access policies.",
                estimated_savings=120000.0
            ))

        # Scenario E: High occupancy + high HVAC usage + poor HVAC health + no security issue + rising cost
        if has_high_occ and has_high_hvac_energy and has_poor_hvac_health and has_no_sec_issue and has_high_cost:
            insights.append(AgentInsight(
                facility_id=facility_id,
                title="Occupancy-Driven HVAC Overload",
                description="HVAC under sustained load due to high occupancy, leading to inefficiency and cost increases.",
                severity="HIGH",
                agents_involved=["occupancy", "energy", "maintenance", "security", "cost"],
                recommended_action="Prioritize HVAC maintenance and optimize cooling settings instead of reducing occupancy-related operations.",
                estimated_savings=60000.0
            ))

        # Deduplicate and save
        for insight in insights:
            # Check if similar insight already exists recently
            cutoff = datetime.now(timezone.utc) - timedelta(days=7)
            existing = self.db.query(AgentInsight).filter(
                AgentInsight.facility_id == facility_id,
                AgentInsight.title == insight.title,
                AgentInsight.timestamp >= cutoff
            ).first()
            if not existing:
                self.db.add(insight)
                
        self.db.commit()
        return insights

    def get_insights(self, facility_id: str = None, limit: int = 10):
        q = self.db.query(AgentInsight)
        if facility_id:
            q = q.filter(AgentInsight.facility_id == facility_id)
        return q.order_by(AgentInsight.timestamp.desc()).limit(limit).all()

    def get_recommendations(self, facility_id: str = None, limit: int = 10):
        q = self.db.query(AgentInsight).filter(AgentInsight.recommended_action != None)
        if facility_id:
            q = q.filter(AgentInsight.facility_id == facility_id)
        return q.order_by(AgentInsight.timestamp.desc()).limit(limit).all()