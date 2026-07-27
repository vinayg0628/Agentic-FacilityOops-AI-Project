from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.facility import Facility
from app.schemas.facility import FacilitySchema
from typing import List

router = APIRouter(prefix="/facilities", tags=["Facilities"])

@router.get("", response_model=List[FacilitySchema])
def get_facilities(db: Session = Depends(get_db)):
    facilities = db.query(Facility).all()
    return facilities

@router.get("/{facility_id}", response_model=FacilitySchema)
def get_facility(facility_id: str, db: Session = Depends(get_db)):
    facility = db.query(Facility).filter(Facility.facility_id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility
