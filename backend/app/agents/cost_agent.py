import logging
from typing import Dict, Any, List

logger = logging.getLogger("facilityops.cost_agent")

class CostAgent:
    """
    AI Agent responsible for peak-demand charge forecasting, dynamic tariff optimization,
    and energy billing reduction.
    """
    def __init__(self):
        self.tariff_rate_kwh = 0.14  # USD per kWh
        self.peak_demand_charge_kw = 18.50  # USD per kW

    def calculate_cost_savings(self, telemetry_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates total energy spend, peak demand penalty, and savings potential."""
        if not telemetry_data:
            return {"total_cost_usd": 0.0, "potential_savings_usd": 0.0}

        total_kwh = sum(item.get("power_kw", 0) for item in telemetry_data)
        peak_kw = max((item.get("power_kw", 0) for item in telemetry_data), default=0)
        
        energy_cost = total_kwh * self.tariff_rate_kwh
        peak_cost = peak_kw * self.peak_demand_charge_kw
        total_spend = energy_cost + peak_cost
        
        # Estimate 15% savings via automated peak shaving
        potential_savings = total_spend * 0.15

        return {
            "total_spend_usd": round(total_spend, 2),
            "energy_cost_usd": round(energy_cost, 2),
            "peak_demand_penalty_usd": round(peak_cost, 2),
            "potential_savings_usd": round(potential_savings, 2),
            "peak_shaving_recommendation": f"Reduce load during 14:00-18:00 to shave peak demand below {int(peak_kw * 0.85)} kW."
        }
