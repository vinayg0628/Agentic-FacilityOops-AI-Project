import io
import pandas as pd
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.energy import EnergyUsage
from app.models.facility import Facility
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter(prefix="/export", tags=["Reports Export"])

def _get_export_dataframe(db: Session, facility_id: Optional[str] = None):
    query = db.query(
        EnergyUsage.energy_id,
        EnergyUsage.facility_id,
        Facility.facility_name,
        Facility.facility_type,
        EnergyUsage.timestamp,
        EnergyUsage.electricity_kwh,
        EnergyUsage.water_liters,
        EnergyUsage.hvac_kwh,
        EnergyUsage.lighting_kwh,
        EnergyUsage.solar_generation_kwh,
        EnergyUsage.power_factor,
        EnergyUsage.temperature,
        EnergyUsage.humidity
    ).join(Facility, EnergyUsage.facility_id == Facility.facility_id)

    if facility_id and facility_id != "ALL":
        query = query.filter(EnergyUsage.facility_id == facility_id)

    results = query.order_by(EnergyUsage.timestamp.desc()).limit(1000).all()
    
    data = []
    for r in results:
        data.append({
            "Record ID": r.energy_id,
            "Facility ID": r.facility_id,
            "Facility Name": r.facility_name,
            "Facility Type": r.facility_type,
            "Timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "Electricity (kWh)": r.electricity_kwh,
            "Water (Liters)": r.water_liters,
            "HVAC (kWh)": r.hvac_kwh,
            "Lighting (kWh)": r.lighting_kwh,
            "Solar Gen (kWh)": r.solar_generation_kwh,
            "Power Factor": r.power_factor,
            "Temperature (°C)": r.temperature,
            "Humidity (%)": r.humidity
        })

    return pd.DataFrame(data)

@router.get("/csv")
def export_csv(facility_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    df = _get_export_dataframe(db, facility_id)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    filename = f"energy_report_{facility_id or 'all'}.csv"
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"
    return response

@router.get("/excel")
def export_excel(facility_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    df = _get_export_dataframe(db, facility_id)
    output = io.BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name="Energy Telemetry", index=False)
        
    output.seek(0)
    filename = f"energy_report_{facility_id or 'all'}.xlsx"
    headers = {'Content-Disposition': f'attachment; filename="{filename}"'}
    return StreamingResponse(output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)

@router.get("/pdf")
def export_pdf(facility_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    df = _get_export_dataframe(db, facility_id)
    buffer = io.BytesIO()
    
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=12
    )
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=20
    )

    elements.append(Paragraph("Agentic FacilityOps AI Platform", title_style))
    elements.append(Paragraph(f"Energy Intelligence & Telemetry Audit Report — Filter: {facility_id or 'All Facilities'}", subtitle_style))
    elements.append(Spacer(1, 10))

    # Summary table
    summary_data = [
        ["Total Telemetry Records", str(len(df))],
        ["Total Electricity (kWh)", f"{df['Electricity (kWh)'].sum():,.2f}" if len(df) > 0 else "0.0"],
        ["Total Water Usage (Liters)", f"{df['Water (Liters)'].sum():,.1f}" if len(df) > 0 else "0.0"],
        ["Total HVAC Consumption (kWh)", f"{df['HVAC (kWh)'].sum():,.2f}" if len(df) > 0 else "0.0"],
        ["Average Power Factor", f"{df['Power Factor'].mean():.2f}" if len(df) > 0 else "0.0"]
    ]
    t_summary = Table(summary_data, colWidths=[200, 300])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1e293b')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0'))
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Recent Telemetry Log (Sample)", styles['Heading2']))
    elements.append(Spacer(1, 10))

    # Data preview table (first 15 rows)
    table_headers = ["ID", "Facility", "Timestamp", "Electricity (kWh)", "HVAC (kWh)", "Power Factor"]
    preview_df = df.head(15)
    table_rows = [table_headers]
    for _, row in preview_df.iterrows():
        table_rows.append([
            str(row["Record ID"]),
            str(row["Facility Name"])[:15],
            str(row["Timestamp"])[:16],
            f"{row['Electricity (kWh)']:.1f}",
            f"{row['HVAC (kWh)']:.1f}",
            f"{row['Power Factor']:.2f}"
        ])

    t_data = Table(table_rows, colWidths=[35, 120, 110, 85, 80, 70])
    t_data.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ALIGN', (3, 0), (-1, -1), 'RIGHT')
    ]))
    elements.append(t_data)

    doc.build(elements)
    buffer.seek(0)
    
    filename = f"energy_report_{facility_id or 'all'}.pdf"
    headers = {'Content-Disposition': f'attachment; filename="{filename}"'}
    return StreamingResponse(buffer, media_type='application/pdf', headers=headers)
