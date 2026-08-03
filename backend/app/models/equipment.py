import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

# Equipment - tracks physical assets in the facility
class Equipment(Base):
    """Physical assets tracked in the facility."""
    __tablename__ = 'equipment'
    equipment_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    facility_id = Column(String(50), ForeignKey('facilities.facility_id'), nullable=False, index=True)
    equipment_name = Column(String(150), nullable=False)
    equipment_type = Column(String(100), nullable=False)  # HVAC, Generator, Water Pump, Elevator, UPS, Transformer, Chiller, Air Compressor, Lighting Panel, Solar Inverter
    manufacturer = Column(String(100), nullable=True, default='Unknown')
    installation_date = Column(DateTime, nullable=True)
    expected_life_years = Column(Integer, default=15)
    location = Column(String(200), nullable=True)
    status = Column(String(50), default='Operational')  # Operational, Under Maintenance, Offline, Decommissioned
    # Relationships
    monitoring_records = relationship('MaintenanceMonitoring', back_populates='equipment', cascade='all, delete-orphan')
    maintenance_alerts = relationship('MaintenanceAlert', back_populates='equipment', cascade='all, delete-orphan')
    maintenance_schedules = relationship('MaintenanceSchedule', back_populates='equipment', cascade='all, delete-orphan')
    facility = relationship('Facility', back_populates='equipment_list')

# MaintenanceMonitoring - sensor readings per equipment
class MaintenanceMonitoring(Base):
    """Sensor readings and telemetrics per equipment."""
    __tablename__ = 'maintenance_monitoring'
    monitoring_id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(Integer, ForeignKey('equipment.equipment_id'), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    temperature = Column(Float, default=25.0)       # Celsius
    vibration = Column(Float, default=1.0)           # mm/s
    runtime_hours = Column(Float, default=0.0)       # cumulative hours
    pressure = Column(Float, default=1.0)            # bar
    humidity = Column(Float, default=50.0)           # %
    power_consumption = Column(Float, default=0.0)   # kWh
    operating_status = Column(String(50), default='Running')  # Running, Idle, Fault, Standby
    equipment = relationship('Equipment', back_populates='monitoring_records')

# MaintenanceAlert - AI-generated alerts
class MaintenanceAlert(Base):
    """AI-generated predictive maintenance alerts."""
    __tablename__ = 'maintenance_alerts'
    alert_id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(Integer, ForeignKey('equipment.equipment_id'), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    severity = Column(String(20), nullable=False)    # Critical, High, Medium, Low
    issue = Column(String(300), nullable=False)
    recommendation = Column(String(500), nullable=True)
    status = Column(String(50), default='Open')      # Open, Acknowledged, Resolved
    equipment = relationship('Equipment', back_populates='maintenance_alerts')

# MaintenanceSchedule - planned maintenance tasks
class MaintenanceSchedule(Base):
    """Planned, preventive, and corrective maintenance tasks."""
    __tablename__ = 'maintenance_schedule'
    schedule_id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(Integer, ForeignKey('equipment.equipment_id'), nullable=False, index=True)
    next_service_date = Column(DateTime, nullable=False)
    maintenance_type = Column(String(100), nullable=False)  # Preventive, Corrective, Predictive, Emergency
    priority = Column(String(20), default='Medium')         # Critical, High, Medium, Low
    assigned_engineer = Column(String(150), nullable=True)
    status = Column(String(50), default='Scheduled')        # Scheduled, In Progress, Completed, Overdue
    estimated_duration_hours = Column(Float, default=2.0)
    estimated_cost_usd = Column(Float, default=500.0)
    notes = Column(String(500), nullable=True)
    equipment = relationship('Equipment', back_populates='maintenance_schedules')
