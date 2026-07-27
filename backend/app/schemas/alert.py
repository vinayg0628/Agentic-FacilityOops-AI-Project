from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AlertBase(BaseModel):
    facility_id: str
    severity: str
    alert_type: str
    message: str
    recommendation: str
    status: str = "Open"

class AlertCreate(AlertBase):
    timestamp: Optional[datetime] = None

class AlertStatusUpdate(BaseModel):
    status: str

class AlertResponse(AlertBase):
    alert_id: int
    timestamp: datetime
    facility_name: Optional[str] = None

    class Config:
        from_attributes = True
