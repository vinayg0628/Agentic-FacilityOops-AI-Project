from sqlalchemy import Column, String, DateTime, JSON, Float
from datetime import datetime, timezone
import uuid
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AgentEvent(Base):
    __tablename__ = "agent_events"

    event_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), nullable=False)
    agent = Column(String(50), nullable=False) # energy, maintenance, occupancy, security, cost
    event_type = Column(String(100), nullable=False)
    severity = Column(String(50), default="INFO")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    data = Column(JSON, default=dict)

class AgentInsight(Base):
    __tablename__ = "agent_insights"

    insight_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(1000))
    severity = Column(String(50), default="MEDIUM")
    agents_involved = Column(JSON, default=list) # e.g., ["energy", "cost"]
    recommended_action = Column(String(1000))
    estimated_savings = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
