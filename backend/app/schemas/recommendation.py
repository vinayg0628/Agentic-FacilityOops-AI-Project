from pydantic import BaseModel
from typing import Optional

class RecommendationItem(BaseModel):
    id: str
    facility_id: str
    facility_name: str
    title: str
    priority: str  # High, Medium, Low
    estimated_savings_usd: float
    estimated_savings_kwh: float
    reason: str
    suggested_action: str
    category: str  # HVAC, Lighting, Power Factor, Water, General
