from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class CostRecord(Base):
    __tablename__ = "cost_records"

    cost_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False)
    category = Column(String(100), nullable=False) # Energy, Maintenance, Security, Water, Labor, Vendor, Administration, Equipment, Operations
    subcategory = Column(String(100))
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    department = Column(String(100))
    vendor_id = Column(String(50), ForeignKey("vendors.vendor_id"), nullable=True)
    description = Column(String(255))
    status = Column(String(50), default="COMPLETED")

class Budget(Base):
    __tablename__ = "budgets"

    budget_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False)
    department = Column(String(100))
    category = Column(String(100), nullable=False)
    budget_period = Column(String(50), nullable=False) # e.g., "2023-Q4", "2023-11"
    allocated_amount = Column(Float, nullable=False)
    spent_amount = Column(Float, default=0.0)
    remaining_amount = Column(Float, default=0.0)
    percentage_used = Column(Float, default=0.0)
    projected_final_spend = Column(Float, default=0.0)
    variance = Column(Float, default=0.0)
    status = Column(String(50), default="ON_TRACK") # ON_TRACK, WARNING, OVER_BUDGET, CRITICAL

class BudgetTransaction(Base):
    __tablename__ = "budget_transactions"

    transaction_id = Column(String(50), primary_key=True, default=generate_uuid)
    budget_id = Column(String(50), ForeignKey("budgets.budget_id"), nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    description = Column(String(255))
    cost_id = Column(String(50), ForeignKey("cost_records.cost_id"), nullable=True)

class ResourceAllocation(Base):
    __tablename__ = "resource_allocations"

    allocation_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False)
    resource_type = Column(String(100), nullable=False) # Staff, Energy, Equipment, Security, Workspace, Maintenance, Vendors
    department = Column(String(100))
    current_allocation = Column(Float)
    recommended_allocation = Column(Float)
    estimated_cost = Column(Float)
    estimated_savings = Column(Float)
    priority = Column(String(50), default="MEDIUM")
    status = Column(String(50), default="ACTIVE")

class CostAnomaly(Base):
    __tablename__ = "cost_anomalies"

    anomaly_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False)
    category = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expected_cost = Column(Float)
    actual_cost = Column(Float)
    deviation_percentage = Column(Float)
    anomaly_score = Column(Float)
    severity = Column(String(50), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    explanation = Column(String(500))
    status = Column(String(50), default="OPEN") # OPEN, RESOLVED, IGNORED

class OptimizationOpportunity(Base):
    __tablename__ = "optimization_opportunities"

    opportunity_id = Column(String(50), primary_key=True, default=generate_uuid)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False)
    category = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(String(1000))
    current_cost = Column(Float)
    estimated_saving = Column(Float)
    implementation_cost = Column(Float)
    annual_saving = Column(Float)
    priority = Column(String(50), default="MEDIUM")
    confidence = Column(Float) # e.g. 0.85
    status = Column(String(50), default="IDENTIFIED") # IDENTIFIED, APPROVED, IMPLEMENTED, VERIFIED, CLOSED

class ROIAnalysis(Base):
    __tablename__ = "roi_analysis"

    roi_id = Column(String(50), primary_key=True, default=generate_uuid)
    opportunity_id = Column(String(50), ForeignKey("optimization_opportunities.opportunity_id"), nullable=False)
    investment_amount = Column(Float)
    annual_saving = Column(Float)
    roi_percentage = Column(Float)
    payback_period_months = Column(Float)
    net_benefit_5yr = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SavingsTracking(Base):
    __tablename__ = "savings_tracking"

    saving_id = Column(String(50), primary_key=True, default=generate_uuid)
    opportunity_id = Column(String(50), ForeignKey("optimization_opportunities.opportunity_id"), nullable=False)
    facility_id = Column(String(50), ForeignKey("facilities.facility_id"), nullable=False)
    projected_saving = Column(Float)
    realized_saving = Column(Float, default=0.0)
    month = Column(String(50)) # e.g., "2023-11"
    cumulative_saving = Column(Float, default=0.0)
    status = Column(String(50), default="IDENTIFIED")
