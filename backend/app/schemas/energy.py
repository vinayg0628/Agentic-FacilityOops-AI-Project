from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EnergyUsageBase(BaseModel):
    facility_id: str
    timestamp: Optional[datetime] = None
    electricity_kwh: float
    water_liters: float
    hvac_kwh: float
    lighting_kwh: float
    solar_generation_kwh: float
    power_factor: float
    temperature: float
    humidity: float

class EnergyUsageCreate(EnergyUsageBase):
    pass

class EnergyUsageResponse(EnergyUsageBase):
    energy_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
