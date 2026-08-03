from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.equipment import Equipment, MaintenanceMonitoring
from app.agents.maintenance_agent import MaintenanceAgent
from app.models.facility import Facility

router = APIRouter(prefix='/equipment', tags=['equipment'])

class EquipmentCreate(BaseModel):
    facility_id: str
    equipment_name: str
    equipment_type: str
    manufacturer: Optional[str] = 'Unknown'
    installation_date: Optional[datetime] = None
    expected_life_years: Optional[int] = 15
    location: Optional[str] = None
    status: Optional[str] = 'Operational'

class EquipmentUpdate(BaseModel):
    equipment_name: Optional[str] = None
    equipment_type: Optional[str] = None
    manufacturer: Optional[str] = None
    expected_life_years: Optional[int] = None
    location: Optional[str] = None
    status: Optional[str] = None

class EquipmentResponse(EquipmentCreate):
    equipment_id: int
    facility_name: Optional[str] = None
    health_score: Optional[float] = None
    health_category: Optional[str] = None

    class Config:
        from_attributes = True

@router.get('/', response_model=List[EquipmentResponse])
def list_equipment(
    facility_id: Optional[str] = None,
    equipment_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Equipment)
    if facility_id and facility_id.upper() != 'ALL':
        query = query.filter(Equipment.facility_id == facility_id)
    if equipment_type and equipment_type.upper() != 'ALL':
        query = query.filter(Equipment.equipment_type == equipment_type)
    if status and status.upper() != 'ALL':
        query = query.filter(Equipment.status == status)
        
    equipments = query.all()
    results = []
    agent = MaintenanceAgent()
    
    for eq in equipments:
        fac = db.query(Facility).filter(Facility.facility_id == eq.facility_id).first()
        
        # Get basic health score fast
        records = db.query(MaintenanceMonitoring).filter(
            MaintenanceMonitoring.equipment_id == eq.equipment_id
        ).order_by(MaintenanceMonitoring.timestamp.desc()).limit(10).all()
        
        records_dict = [{'temperature': r.temperature, 'vibration': r.vibration, 'runtime_hours': r.runtime_hours, 'pressure': r.pressure, 'power_consumption': r.power_consumption, 'operating_status': r.operating_status} for r in reversed(records)]
        score = agent.calculate_health_score(eq.equipment_type, records_dict)
        cat = agent.get_health_category(score)
        
        results.append({
            'equipment_id': eq.equipment_id,
            'facility_id': eq.facility_id,
            'facility_name': fac.facility_name if fac else None,
            'equipment_name': eq.equipment_name,
            'equipment_type': eq.equipment_type,
            'manufacturer': eq.manufacturer,
            'installation_date': eq.installation_date,
            'expected_life_years': eq.expected_life_years,
            'location': eq.location,
            'status': eq.status,
            'health_score': round(score, 1),
            'health_category': cat
        })
    return results

@router.get('/{equipment_id}', response_model=EquipmentResponse)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    fac = db.query(Facility).filter(Facility.facility_id == eq.facility_id).first()
    
    records = db.query(MaintenanceMonitoring).filter(
        MaintenanceMonitoring.equipment_id == equipment_id
    ).order_by(MaintenanceMonitoring.timestamp.desc()).limit(100).all()
    
    agent = MaintenanceAgent()
    records_dict = [{'temperature': r.temperature, 'vibration': r.vibration, 'runtime_hours': r.runtime_hours, 'pressure': r.pressure, 'power_consumption': r.power_consumption, 'operating_status': r.operating_status} for r in reversed(records)]
    
    score = agent.calculate_health_score(eq.equipment_type, records_dict)
    cat = agent.get_health_category(score)
    
    return {
        'equipment_id': eq.equipment_id,
        'facility_id': eq.facility_id,
        'facility_name': fac.facility_name if fac else None,
        'equipment_name': eq.equipment_name,
        'equipment_type': eq.equipment_type,
        'manufacturer': eq.manufacturer,
        'installation_date': eq.installation_date,
        'expected_life_years': eq.expected_life_years,
        'location': eq.location,
        'status': eq.status,
        'health_score': round(score, 1),
        'health_category': cat
    }

@router.post('/', response_model=EquipmentResponse)
def create_equipment(eq_in: EquipmentCreate, db: Session = Depends(get_db)):
    db_eq = Equipment(**eq_in.dict())
    db.add(db_eq)
    db.commit()
    db.refresh(db_eq)
    
    # Setup dummy response wrapper
    fac = db.query(Facility).filter(Facility.facility_id == db_eq.facility_id).first()
    response_dict = db_eq.__dict__.copy()
    response_dict['facility_name'] = fac.facility_name if fac else None
    response_dict['health_score'] = 100.0
    response_dict['health_category'] = 'Excellent'
    return response_dict

@router.put('/{equipment_id}', response_model=EquipmentResponse)
def update_equipment(equipment_id: int, eq_in: EquipmentUpdate, db: Session = Depends(get_db)):
    db_eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    for var, value in eq_in.dict(exclude_unset=True).items():
        setattr(db_eq, var, value)
        
    db.commit()
    db.refresh(db_eq)
    
    fac = db.query(Facility).filter(Facility.facility_id == db_eq.facility_id).first()
    response_dict = db_eq.__dict__.copy()
    response_dict['facility_name'] = fac.facility_name if fac else None
    return response_dict

@router.delete('/{equipment_id}', status_code=204)
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    db_eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    db.delete(db_eq)
    db.commit()
    return None
