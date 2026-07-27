from pydantic import BaseModel

class FacilityBase(BaseModel):
    facility_name: str
    facility_type: str
    city: str
    state: str
    total_floors: int
    total_area_sqft: float

class FacilityCreate(FacilityBase):
    facility_id: str

class FacilitySchema(FacilityBase):
    facility_id: str

    class Config:
        from_attributes = True
