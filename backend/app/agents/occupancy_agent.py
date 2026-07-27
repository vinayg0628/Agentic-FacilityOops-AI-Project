import logging
from typing import Dict, Any, List

logger = logging.getLogger("facilityops.occupancy_agent")

class OccupancyAgent:
    """
    AI Agent responsible for occupancy tracking, space utilization optimization,
    and adaptive lighting/climate scheduling.
    """
    def __init__(self):
        self.model_name = "Space Utilization Optimization Model v1.0"

    def optimize_occupancy_schedules(self, telemetry_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyzes headcount telemetry and proposes lighting/climate setpoint adjustments."""
        if not telemetry_data:
            return {"occupancy_rate": 0.0, "status": "Optimal", "insights": []}

        occupancies = [item.get("occupancy_count", 0) for item in telemetry_data]
        avg_occupancy = sum(occupancies) / len(occupancies) if occupancies else 0
        peak_occupancy = max(occupancies) if occupancies else 0
        
        insights = []
        if avg_occupancy < 20:
            insights.append("Low night/weekend occupancy detected. Set thermostat to setback mode (78°F / 25.5°C).")
        if peak_occupancy > 150:
            insights.append("High peak occupancy detected in main hall. Boost ventilation CFM during 10:00-14:00 window.")

        return {
            "avg_occupancy": round(avg_occupancy, 1),
            "peak_occupancy": peak_occupancy,
            "status": "High Density" if peak_occupancy > 150 else "Normal",
            "insights": insights
        }
