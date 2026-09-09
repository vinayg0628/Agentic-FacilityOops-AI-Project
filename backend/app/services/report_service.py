import os
import pandas as pd
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

from app.models.cost_models import CostRecord
from app.models.event_models import AgentInsight

class ReportService:
    def __init__(self, db: Session):
        self.db = db
        os.makedirs("exports", exist_ok=True)

    def generate_csv_report(self, facility_id: str) -> str:
        records = self.db.query(CostRecord).filter(CostRecord.facility_id == facility_id).all()
        if not records:
            return ""
            
        df = pd.DataFrame([{
            "Cost ID": r.cost_id,
            "Category": r.category,
            "Amount": r.amount,
            "Timestamp": r.timestamp.isoformat()
        } for r in records])
        
        filename = f"exports/facility_{facility_id}_cost_report_{datetime.now().strftime('%Y%m%d%H%M')}.csv"
        df.to_csv(filename, index=False)
        return filename

    def generate_pdf_report(self, facility_id: str) -> str:
        filename = f"exports/facility_{facility_id}_intelligence_report_{datetime.now().strftime('%Y%m%d%H%M')}.pdf"
        c = canvas.Canvas(filename, pagesize=letter)
        width, height = letter
        
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, f"Facility Intelligence Report: {facility_id}")
        
        c.setFont("Helvetica", 10)
        c.drawString(50, height - 70, f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC")
        
        # Insights Section
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 100, "Top AI Insights:")
        
        insights = self.db.query(AgentInsight).filter(AgentInsight.facility_id == facility_id).order_by(AgentInsight.severity).limit(5).all()
        
        y = height - 130
        c.setFont("Helvetica", 10)
        if not insights:
            c.drawString(60, y, "No active insights found.")
        else:
            for i in insights:
                c.drawString(60, y, f"- [{i.severity}] {i.title}: {i.recommended_action} (Est. Savings: {i.estimated_savings})")
                y -= 20
                
        # Costs Section
        y -= 20
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Cost Distribution:")
        
        y -= 30
        c.setFont("Helvetica", 10)
        costs = self.db.query(CostRecord).filter(CostRecord.facility_id == facility_id).order_by(CostRecord.timestamp.desc()).limit(10).all()
        for r in costs:
            c.drawString(60, y, f"{r.timestamp.strftime('%Y-%m-%d')} | {r.category} | {r.amount}")
            y -= 20
            if y < 50:
                c.showPage()
                y = height - 50

        c.save()
        return filename
