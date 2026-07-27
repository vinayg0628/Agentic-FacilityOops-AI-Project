import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.energy_agent import EnergyAgent
from app.agents.maintenance_agent import MaintenanceAgent
from app.agents.occupancy_agent import OccupancyAgent
from app.agents.security_agent import SecurityAgent
from app.agents.cost_agent import CostAgent

logger = logging.getLogger("facilityops.intelligence_engine")

class IntelligenceEngine:
    """
    Master Multi-Agent Intelligence Engine for Facility Operations.
    Coordinates domain-specific AI agents (Energy, Maintenance, Occupancy, Security, Cost).
    """
    def __init__(self, db: Session = None):
        self.db = db
        self.energy_agent = EnergyAgent(db=db)
        self.maintenance_agent = MaintenanceAgent()
        self.occupancy_agent = OccupancyAgent()
        self.security_agent = SecurityAgent()
        self.cost_agent = CostAgent()

    def run_full_diagnosis(self, telemetry_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs multi-agent holistic facility diagnosis."""
        logger.info("Executing Master Intelligence Engine Multi-Agent Diagnosis...")
        
        maint_res = self.maintenance_agent.analyze_equipment_health(telemetry_data)
        occ_res = self.occupancy_agent.optimize_occupancy_schedules(telemetry_data)
        sec_res = self.security_agent.scan_security_status(telemetry_data)
        cost_res = self.cost_agent.calculate_cost_savings(telemetry_data)

        overall_health = round((
            maint_res.get("health_score", 90) * 0.4 +
            sec_res.get("security_score", 90) * 0.3 +
            85.0 * 0.3
        ), 1)

        return {
            "overall_health_score": max(20.0, min(100.0, overall_health)),
            "maintenance_insights": maint_res,
            "occupancy_insights": occ_res,
            "security_insights": sec_res,
            "cost_insights": cost_res
        }
