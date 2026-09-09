from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Vendor(Base):
    __tablename__ = "vendors"

    vendor_id = Column(String(50), primary_key=True, default=generate_uuid)
    vendor_name = Column(String(150), nullable=False)
    service_type = Column(String(100))
    contract_start = Column(Date)
    contract_end = Column(Date)
    contract_value = Column(Float)
    SLA_percentage = Column(Float)
    performance_score = Column(Float)
    response_time = Column(Float) # in hours
    quality_score = Column(Float)
    status = Column(String(50), default="ACTIVE")

class VendorContract(Base):
    __tablename__ = "vendor_contracts"
    
    contract_id = Column(String(50), primary_key=True, default=generate_uuid)
    vendor_id = Column(String(50), ForeignKey("vendors.vendor_id"), nullable=False)
    contract_value = Column(Float)
    renewal_date = Column(Date)
    SLA = Column(String(255))
    utilization = Column(Float)
    spending = Column(Float)
    performance = Column(Float)
    penalties = Column(Float, default=0.0)
    savings = Column(Float, default=0.0)
