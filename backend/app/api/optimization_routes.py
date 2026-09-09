from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.roi_service import calculate_roi, calculate_payback_period

router = APIRouter(prefix="/optimization", tags=["Optimization Center"])

class SimulatorRequest(BaseModel):
    hvac_reduction_pct: float = 0.0
    lighting_reduction_pct: float = 0.0
    workspace_consolidation_floors: int = 0
    vendor_reduction_pct: float = 0.0
    preventive_maintenance_shift_pct: float = 0.0

@router.post("/simulate")
def simulate_optimization(req: SimulatorRequest):
    # This is a simulation engine logic
    # In reality, this would query baseline energy usage and calculate exact values.
    
    # Baseline dummy values for simulation
    base_hvac_cost_monthly = 180000
    base_lighting_cost_monthly = 45000
    base_workspace_cost_per_floor = 80000
    base_vendor_cost = 250000
    base_reactive_maint = 90000
    
    hvac_saving = base_hvac_cost_monthly * (req.hvac_reduction_pct / 100)
    lighting_saving = base_lighting_cost_monthly * (req.lighting_reduction_pct / 100)
    workspace_saving = base_workspace_cost_per_floor * req.workspace_consolidation_floors
    vendor_saving = base_vendor_cost * (req.vendor_reduction_pct / 100)
    
    # Shifting from reactive to preventive saves roughly 30% of the shifted amount in the long run
    maint_saving = base_reactive_maint * (req.preventive_maintenance_shift_pct / 100) * 0.30
    
    monthly_savings = hvac_saving + lighting_saving + workspace_saving + vendor_saving + maint_saving
    annual_savings = monthly_savings * 12
    
    # Rough implementation costs
    impl_hvac = hvac_saving * 2 # takes 2 months saving to implement
    impl_light = lighting_saving * 1.5
    impl_workspace = workspace_saving * 1.2
    impl_vendor = 0 # Vendor reduction usually administrative
    impl_maint = maint_saving * 1.1
    
    total_impl_cost = impl_hvac + impl_light + impl_workspace + impl_vendor + impl_maint
    
    roi = calculate_roi(total_impl_cost, annual_savings)
    payback = calculate_payback_period(total_impl_cost, monthly_savings)
    
    return {
        "monthly_savings": monthly_savings,
        "annual_savings": annual_savings,
        "implementation_cost": total_impl_cost,
        "roi": roi,
        "payback_period_months": payback,
        "energy_reduction_kwh": (hvac_saving + lighting_saving) / 0.14, # assuming $0.14/kWh
        "carbon_reduction_kg": ((hvac_saving + lighting_saving) / 0.14) * 0.4, # 0.4 kg CO2 per kWh
        "operational_impact": "High" if (req.workspace_consolidation_floors > 2 or req.vendor_reduction_pct > 20) else "Medium"
    }
