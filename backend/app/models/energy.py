from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class EnergyUsage(Base):
    __tablename__ = "energy_usage"

    energy_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    electricity_kwh = Column(Float, nullable=False, default=0.0)
    water_liters = Column(Float, nullable=False, default=0.0)
    hvac_kwh = Column(Float, nullable=False, default=0.0)
    lighting_kwh = Column(Float, nullable=False, default=0.0)
    solar_generation_kwh = Column(Float, nullable=False, default=0.0)
    power_factor = Column(Float, nullable=False, default=0.95)
    temperature = Column(Float, nullable=False, default=24.0)
    humidity = Column(Float, nullable=False, default=50.0)

    # Relationship
    facility = relationship("Facility", back_populates="energy_records")
