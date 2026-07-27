from pydantic import BaseModel
from typing import List, Dict, Any

class HourlyTrendItem(BaseModel):
    hour: str
    electricity_kwh: float
    hvac_kwh: float
    lighting_kwh: float
    solar_kwh: float
    water_liters: float

class DailyTrendItem(BaseModel):
    date: str
    electricity_kwh: float
    water_liters: float
    hvac_kwh: float
    solar_kwh: float

class CategoryBreakdownItem(BaseModel):
    category: str
    kwh: float
    percentage: float

class FacilityComparisonItem(BaseModel):
    facility_id: str
    facility_name: str
    facility_type: str
    electricity_kwh: float
    water_liters: float
    efficiency_score: float
    carbon_emissions_kg: float

class PeakHourItem(BaseModel):
    hour: int
    hour_label: str
    avg_kwh: float
    is_peak: bool

class AnalyticsSummary(BaseModel):
    total_electricity_kwh: float
    today_electricity_kwh: float
    yesterday_electricity_kwh: float
    electricity_change_pct: float
    today_water_liters: float
    hvac_total_kwh: float
    lighting_total_kwh: float
    solar_total_kwh: float
    active_alerts_count: int
    critical_alerts_count: int
    energy_efficiency_score: float
    carbon_emissions_ton_co2: float
    average_hourly_kwh: float
    peak_consumption_hour: str
    peak_consumption_kwh: float
    hourly_trend: List[HourlyTrendItem]
    daily_trend: List[DailyTrendItem]
    monthly_trend: List[DailyTrendItem]
    category_breakdown: List[CategoryBreakdownItem]
    facility_comparison: List[FacilityComparisonItem]
    peak_hours: List[PeakHourItem]
