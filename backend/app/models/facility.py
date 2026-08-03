from sqlalchemy import Column, String, Integer, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Facility(Base):
    __tablename__ = "facilities"

    facility_id = Column(String(50), primary_key=True, index=True)
    facility_name = Column(String(150), nullable=False)
    facility_type = Column(String(100), nullable=False)  # IT Park, Hospital, University, Shopping Mall, Factory
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    total_floors = Column(Integer, default=1)
    total_area_sqft = Column(Float, default=10000.0)

    # Relationships
    energy_records = relationship("EnergyUsage", back_populates="facility", cascade="all, delete-orphan")
    alerts = relationship("EnergyAlert", back_populates="facility", cascade="all, delete-orphan")
    equipment_list = relationship("Equipment", back_populates="facility", cascade="all, delete-orphan")
