from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.services.report_service import ReportService
from app.models.report_models import ScheduledReport
import os

router = APIRouter(prefix="/reports/intelligence", tags=["Intelligence Reports"])

class ScheduleRequest(BaseModel):
    report_type: str
    frequency: str
    recipients: str

@router.get("/generate")
def generate_report(facility_id: str = "ALL", format: str = "pdf", db: Session = Depends(get_db)):
    svc = ReportService(db)
    if format == "csv":
        filepath = svc.generate_csv_report(facility_id)
    else:
        filepath = svc.generate_pdf_report(facility_id)
        
    if not filepath or not os.path.exists(filepath):
        return {"error": "Failed to generate report"}
        
    return FileResponse(filepath, filename=os.path.basename(filepath))

@router.post("/schedule")
def api_schedule_report(req: ScheduleRequest, db: Session = Depends(get_db)):
    # Mock scheduling
    sched = ScheduledReport(
        report_type=req.report_type,
        frequency=req.frequency,
        recipients=req.recipients
    )
    db.add(sched)
    db.commit()
    return {"status": "Scheduled successfully", "schedule_id": sched.schedule_id}
