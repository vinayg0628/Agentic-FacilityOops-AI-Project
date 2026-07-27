from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app.core.database import get_db
from app.models.energy import EnergyUsage
from app.models.facility import Facility
from app.schemas.energy import EnergyUsageResponse, EnergyUsageCreate
from app.agents.energy_agent import EnergyAgent

router = APIRouter(prefix="/energy", tags=["Energy"])

@router.get("", response_model=List[EnergyUsageResponse])
def get_energy_records(
    facility_id: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=2000),
    db: Session = Depends(get_db)
):
    query = db.query(EnergyUsage)
    if facility_id and facility_id != "ALL":
        query = query.filter(EnergyUsage.facility_id == facility_id)
    
    records = query.order_by(EnergyUsage.timestamp.desc()).limit(limit).all()
    return records

@router.get("/{facility_id}", response_model=List[EnergyUsageResponse])
def get_energy_by_facility(
    facility_id: str,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    facility = db.query(Facility).filter(Facility.facility_id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
        
    records = db.query(EnergyUsage)\
        .filter(EnergyUsage.facility_id == facility_id)\
        .order_by(EnergyUsage.timestamp.desc())\
        .limit(limit)\
        .all()
    return records

@router.post("", response_model=EnergyUsageResponse, status_code=201)
def create_energy_record(
    payload: EnergyUsageCreate,
    db: Session = Depends(get_db)
):
    # Verify facility exists
    facility = db.query(Facility).filter(Facility.facility_id == payload.facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail=f"Facility '{payload.facility_id}' does not exist.")

    timestamp = payload.timestamp or datetime.utcnow()

    new_record = EnergyUsage(
        facility_id=payload.facility_id,
        timestamp=timestamp,
        electricity_kwh=payload.electricity_kwh,
        water_liters=payload.water_liters,
        hvac_kwh=payload.hvac_kwh,
        lighting_kwh=payload.lighting_kwh,
        solar_generation_kwh=payload.solar_generation_kwh,
        power_factor=payload.power_factor,
        temperature=payload.temperature,
        humidity=payload.humidity
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    # Immediately trigger Energy Agent to evaluate new telemetry for anomalies
    agent = EnergyAgent(db)
    agent.evaluate_facility_telemetry(payload.facility_id)

    return new_record
