import logging
from typing import Dict, Any, List

logger = logging.getLogger("facilityops.maintenance_agent")

class MaintenanceAgent:
    """
    AI Agent responsible for predictive maintenance analytics, equipment degradation tracking,
    and HVAC filter/compressor health monitoring.
    """
    def __init__(self):
        self.model_name = "HVAC Predictive Failure Classifier v1.2"

    def analyze_equipment_health(self, telemetry_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates equipment health score and identifies failure risks."""
        if not telemetry_data:
            return {"health_score": 100.0, "risk_level": "Low", "recommendations": []}

        # Calculate average HVAC efficiency index
        efficiency_sum = sum(item.get("hvac_efficiency", 0.85) for item in telemetry_data)
        avg_efficiency = efficiency_sum / len(telemetry_data)
        
        health_score = max(10.0, min(100.0, round(avg_efficiency * 100, 1)))
        
        risk_level = "Low"
        if health_score < 60:
            risk_level = "High"
        elif health_score < 80:
            risk_level = "Medium"
            
        recommendations = []
        if avg_efficiency < 0.75:
            recommendations.append("Schedule HVAC airflow sensor calibration and filter replacement.")
        if any(item.get("peak_demand_kw", 0) > 400 for item in telemetry_data):
            recommendations.append("Inspect compressor motor bearings for vibration and overheating.")

        return {
            "health_score": health_score,
            "risk_level": risk_level,
            "avg_efficiency": round(avg_efficiency, 2),
            "recommendations": recommendations
        }
