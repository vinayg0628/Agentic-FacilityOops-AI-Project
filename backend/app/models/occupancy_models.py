"""SQLAlchemy ORM models for Occupancy Agent — Phase A."""
import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Index
from app.core.database import Base


class Room(Base):
    __tablename__ = "rooms"
    room_id      = Column(String(50), primary_key=True, index=True)
    facility_id  = Column(String(50), nullable=False, index=True)
    floor        = Column(Integer, nullable=False, default=1)
    room_name    = Column(String(100), nullable=False)
    room_type    = Column(String(50), nullable=False)
    capacity     = Column(Integer, nullable=False, default=20)
    area_sqft    = Column(Float, nullable=True)
    zone         = Column(String(50), nullable=True)
    x_grid       = Column(Integer, default=0)   # position in floor-plan grid
    y_grid       = Column(Integer, default=0)
    status       = Column(String(20), default='active')
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)
    __table_args__ = (Index('ix_rooms_facility_floor', 'facility_id', 'floor'),)


class OccupancyReading(Base):
    __tablename__ = "occupancy_readings"
    occupancy_id   = Column(Integer, primary_key=True, autoincrement=True)
    facility_id    = Column(String(50), nullable=False, index=True)
    room_id        = Column(String(50), ForeignKey('rooms.room_id', ondelete='CASCADE'), nullable=False, index=True)
    floor          = Column(Integer, nullable=False, default=1)
    timestamp      = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    people_count   = Column(Integer, default=0)
    entry_count    = Column(Integer, default=0)
    exit_count     = Column(Integer, default=0)
    capacity       = Column(Integer, nullable=False, default=20)
    occupancy_rate = Column(Float, default=0.0)
    sensor_id      = Column(String(50), nullable=True)
    __table_args__ = (Index('ix_occ_reading_fac_ts', 'facility_id', 'timestamp'),)


class OccupancyEvent(Base):
    """Individual in/out event from badge swipe or people counter."""
    __tablename__ = "occupancy_events"
    event_id      = Column(Integer, primary_key=True, autoincrement=True)
    facility_id   = Column(String(50), nullable=False, index=True)
    room_id       = Column(String(50), ForeignKey('rooms.room_id', ondelete='CASCADE'), nullable=False, index=True)
    floor         = Column(Integer, default=1)
    timestamp     = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    direction     = Column(String(10), default='in')   # 'in' or 'out'
    source        = Column(String(30), default='badge') # badge | motion | counter | booking
    entity_id     = Column(String(100), nullable=True)  # badge/person id
    __table_args__ = (Index('ix_occ_event_fac_ts', 'facility_id', 'timestamp'),)


class OccupancyAlert(Base):
    """Alert created when a room crosses an overcrowding threshold."""
    __tablename__ = "occupancy_alerts"
    alert_id         = Column(Integer, primary_key=True, autoincrement=True)
    facility_id      = Column(String(50), nullable=False, index=True)
    room_id          = Column(String(50), ForeignKey('rooms.room_id', ondelete='CASCADE'), nullable=False)
    room_name        = Column(String(100))
    floor            = Column(Integer, default=1)
    alert_type       = Column(String(50), default='Overcrowding')
    severity         = Column(String(20), default='High')  # High | Critical
    occupancy_pct    = Column(Float, default=0.0)
    people_count     = Column(Integer, default=0)
    capacity         = Column(Integer, default=0)
    triggered_at     = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    resolved_at      = Column(DateTime, nullable=True)
    status           = Column(String(20), default='Active')  # Active | Resolved
    recommended_action = Column(String(300), nullable=True)


class OccupancyPrediction(Base):
    __tablename__ = "occupancy_predictions"
    prediction_id            = Column(Integer, primary_key=True, autoincrement=True)
    facility_id              = Column(String(50), nullable=False, index=True)
    room_id                  = Column(String(50), ForeignKey('rooms.room_id', ondelete='CASCADE'), nullable=False)
    timestamp                = Column(DateTime, nullable=False, index=True)
    predicted_occupancy      = Column(Integer, default=0)
    predicted_occupancy_rate = Column(Float, default=0.0)
    confidence               = Column(Float, default=0.75)
    predicted_peak           = Column(Boolean, default=False)
    prediction_horizon       = Column(Integer, default=1)
    created_at               = Column(DateTime, default=datetime.datetime.utcnow)
