
from pydantic import BaseModel
from typing import List, Optional, Any

class OccupancySummary(BaseModel):
    zone_id: str
    zone_name: str
    current_occupancy: int
    capacity: int
    utilization_pct: float

class OccupancySummaryResponse(BaseModel):
    summary: List[OccupancySummary]

class OccupancyHeatmapResponse(BaseModel):
    data: List[dict]

class OccupancyForecastResponse(BaseModel):
    zone_id: str
    forecast: List[dict]

class SystemAlertResponse(BaseModel):
    alert_id: int
    timestamp: str
    zone_id: Optional[str]
    alert_type: str
    severity: str
    message: str
    status: str

class IncidentResponse(BaseModel):
    event_id: int
    zone_id: str
    entity_id: str
    entity_type: str
    event_type: str
    access_granted: Optional[bool]
    timestamp: str

class VisitorResponse(BaseModel):
    visitor_id: str
    name: str
    host_employee_id: str
    allowed_zones: List[str]
    check_in: str
    check_out: Optional[str]
