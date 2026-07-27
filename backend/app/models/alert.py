from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class EnergyAlert(Base):
    __tablename__ = "energy_alerts"

    alert_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    severity = Column(String(20), nullable=False) # Critical, High, Medium, Low
    alert_type = Column(String(100), nullable=False) # High Energy Consumption, HVAC Overload, Power Spike, Water Leakage, Abnormal Night Usage
    message = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="Open") # Open, In Progress, Resolved

    # Relationship
    facility = relationship("Facility", back_populates="alerts")
