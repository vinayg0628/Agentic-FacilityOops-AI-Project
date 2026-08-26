"""
Agentic AI For Smart Facility Operations And Optimizations
Project Documentation Generator — PDF (Predictive Maintenance Module)
Uses ReportLab to produce a professional, formatted PDF report.
Run: python generate_maint_docs.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
import datetime
import os

# ──────────────────────────────────────────────────────────
# Output path
# ──────────────────────────────────────────────────────────
OUTPUT_PDF = os.path.join(os.path.dirname(__file__), "Smart Facility Operations_AI_Platform_PM_Documentation.pdf")

# ──────────────────────────────────────────────────────────
# Colour palette
# ──────────────────────────────────────────────────────────
DARK_BLUE  = colors.HexColor("#0F172A")
MID_BLUE   = colors.HexColor("#4C1D95") # Violet hue for Maintenance Agent
CYAN       = colors.HexColor("#8B5CF6") # Violet/Purple accent
SLATE_700  = colors.HexColor("#334155")
SLATE_500  = colors.HexColor("#64748B")
SLATE_200  = colors.HexColor("#E2E8F0")
WHITE      = colors.white

# ──────────────────────────────────────────────────────────
# Styles
# ──────────────────────────────────────────────────────────
def S(name, **kw):
    return ParagraphStyle(name, **kw)

SH = S("sh", fontName="Helvetica-Bold", fontSize=13, textColor=WHITE,
        backColor=MID_BLUE, borderPadding=(6,8,6,8), spaceAfter=8, spaceBefore=16, leading=18)
SB = S("sb", fontName="Helvetica-Bold", fontSize=11, textColor=DARK_BLUE,
        spaceAfter=4, spaceBefore=10)
SP = S("sp", fontName="Helvetica", fontSize=9.5, textColor=SLATE_700,
        spaceAfter=5, leading=15, alignment=TA_JUSTIFY)
SBL= S("sbl",fontName="Helvetica", fontSize=9.5, textColor=SLATE_700,
        spaceAfter=3, leading=14, leftIndent=12)
SC = S("sc", fontName="Courier", fontSize=8.5, textColor=colors.HexColor("#0F4C81"),
        backColor=colors.HexColor("#F1F5F9"), borderPadding=(5,6,5,6), spaceAfter=6, leading=13, leftIndent=8)
STH= S("sth",fontName="Helvetica-Bold", fontSize=9, textColor=WHITE, alignment=TA_CENTER)
STC= S("stc",fontName="Helvetica", fontSize=9, textColor=SLATE_700, alignment=TA_LEFT, leading=12)
SHL= S("shl",fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.HexColor("#4C1D95"),
        backColor=colors.HexColor("#EDE9FE"), borderPadding=(5,7,5,7), spaceAfter=6, leading=14, leftIndent=8)
SCA= S("sca",fontName="Helvetica", fontSize=10, textColor=SLATE_700, alignment=TA_CENTER)

def sec(t):   return Paragraph(f"  {t}", SH)
def sub(t):   return Paragraph(t, SB)
def body(t):  return Paragraph(t, SP)
def bul(t):   return Paragraph(f"\u2022  {t}", SBL)
def hi(t):    return Paragraph(t, SHL)
def sp(h=6):  return Spacer(1, h)
def hr():     return HRFlowable(width="100%", thickness=0.5, color=SLATE_200, spaceAfter=4, spaceBefore=4)

def tbl(headers, rows, widths):
    data = [[Paragraph(h, STH) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), STC) for c in row])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,0),  MID_BLUE),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHITE, colors.HexColor("#F8FAFC")]),
        ("GRID",          (0,0),(-1,-1), 0.4, SLATE_200),
        ("FONTSIZE",      (0,0),(-1,-1), 9),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 6),
        ("RIGHTPADDING",  (0,0),(-1,-1), 6),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
    ]))
    return t

def code(t):
    return Paragraph(t.replace("\n","<br/>"),
        S("cd", fontName="Courier", fontSize=8, textColor=colors.HexColor("#4C1D95"),
          backColor=colors.HexColor("#F1F5F9"), borderPadding=(8,10,8,10), leading=12, spaceAfter=6))

def dark_code(t):
    return Paragraph(t.replace("\n","<br/>"),
        S("dk", fontName="Courier", fontSize=9, textColor=WHITE,
          backColor=DARK_BLUE, borderPadding=(8,10,8,10), leading=14, spaceAfter=6))

# ──────────────────────────────────────────────────────────
# Header / Footer
# ──────────────────────────────────────────────────────────
def hdr_ftr(c, doc):
    c.saveState()
    w, h = A4
    c.setFillColor(DARK_BLUE);  c.rect(0, h-28, w, 28, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 9); c.setFillColor(CYAN)
    c.drawString(1.2*cm, h-18, "Agentic AI For Smart Facility Operations And Optimizations")
    c.setFillColor(WHITE); c.setFont("Helvetica", 8)
    c.drawRightString(w-1.2*cm, h-18, "Predictive Maintenance Module — Documentation")
    c.setFillColor(DARK_BLUE); c.rect(0, 0, w, 22, fill=1, stroke=0)
    c.setFillColor(CYAN); c.setFont("Helvetica-Bold", 9)
    c.drawRightString(w-1.2*cm, 7, f"Page {doc.page}")
    c.restoreState()

# ──────────────────────────────────────────────────────────
# PAGES
# ──────────────────────────────────────────────────────────
def cover(story):
    story.append(sp(60))
    cd = [
        [Paragraph("Agentic AI For Smart Facility Operations And Optimizations",
            S("ct", fontName="Helvetica-Bold", fontSize=22, textColor=DARK_BLUE,
              alignment=TA_CENTER, spaceAfter=4, leading=28))],
        [Paragraph("Predictive Maintenance Module",
            S("cs", fontName="Helvetica-Bold", fontSize=15, textColor=CYAN,
              alignment=TA_CENTER, spaceAfter=4))],
        [Paragraph("Technical Project Documentation",
            S("cc", fontName="Helvetica", fontSize=11, textColor=SLATE_500,
              alignment=TA_CENTER, spaceAfter=8))],
        [HRFlowable(width="50%", thickness=2, color=CYAN, spaceAfter=10, hAlign="CENTER")],
        [sp(8)],
        [Paragraph("Version 1.0  |  Predictive Maintenance Module",
            S("v", fontName="Helvetica", fontSize=10, textColor=SLATE_500, alignment=TA_CENTER, spaceAfter=4))],
        [Paragraph(f"Date: {datetime.datetime.now().strftime('%d %B %Y')}",
            S("d", fontName="Helvetica", fontSize=10, textColor=SLATE_500, alignment=TA_CENTER, spaceAfter=4))],
        [sp(16)],
        [Paragraph("Author: G Vinay Kumar  |  Agentic AI Engineering",
            S("a", fontName="Helvetica-Bold", fontSize=11, textColor=DARK_BLUE, alignment=TA_CENTER))],
    ]
    ct = Table(cd, colWidths=[16*cm])
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0,0),(-1,-1), WHITE),
        ("BOX",        (0,0),(-1,-1), 2, CYAN),
        ("TOPPADDING", (0,0),(-1,-1), 8),
        ("BOTTOMPADDING",(0,0),(-1,-1), 8),
        ("ALIGN",      (0,0),(-1,-1), "CENTER"),
    ]))
    story.append(ct)
    story.append(PageBreak())

def toc(story):
    story.append(sec("Table of Contents"))
    items = [
        ("1","Project Overview & Objectives","3"),
        ("2","Problem Statement & Business Impact","3"),
        ("3","Technology Stack","4"),
        ("4","System Architecture","5"),
        ("5","Database Design","6"),
        ("6","Backend — FastAPI Application","7"),
        ("7","AI Maintenance Agent — Health & Predictions","8"),
        ("8","Analytics & Scoring Engine","9"),
        ("9","REST API Endpoints","10"),
        ("10","Frontend — React Dashboard","11"),
        ("11","Dashboard Pages & Features","12"),
        ("12","Data Simulation & Microsoft Azure Dataset","14"),
        ("13","Report Export Engine","14"),
        ("14","Licenses & Open Source","15"),
        ("15","How to Run the Application","15"),
        ("16","Future Roadmap","16"),
    ]
    td = [[Paragraph(f"<b>{n}.</b>  {t}", SP), Paragraph(f"pg. {p}", SCA)] for n,t,p in items]
    tt = Table(td, colWidths=[14*cm, 3*cm])
    tt.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[WHITE, colors.HexColor("#F8FAFC")]),
        ("LINEBELOW",(0,0),(-1,-1),0.3,SLATE_200),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),6),("ALIGN",(1,0),(1,-1),"RIGHT"),
    ]))
    story.append(tt)
    story.append(PageBreak())

# ──────────────────────────────────────────────────────────
def s1_overview(story):
    story.append(sec("1. Project Overview & Objectives"))
    story.append(body(
        "<b>Agentic AI For Smart Facility Operations And Optimizations</b> is a production-grade, enterprise-level AI-powered "
        "Predictive Maintenance system for commercial buildings such as IT Parks, Hospitals, "
        "Universities, Shopping Malls, and Factories. The platform leverages the real-world "
        "<b>Microsoft Azure Predictive Maintenance</b> dataset to simulate IoT telemetry (vibration, pressure, temperature) "
        "across 100 machines. The AI Agent analyses the usage, predicts component failures, generates health scores, "
        "and visualises everything through a professional dashboard."
    ))
    story.append(sp(6))
    story.append(sub("1.1 Core Objectives"))
    objs = [
        ("Real-Time Telemetry","Collect and display hourly voltage, rotation, pressure, and vibration from IoT sensors."),
        ("Health Scoring","Calculate a dynamic 0-100 health score for every piece of equipment based on recent telemetry anomalies."),
        ("Failure Prediction","Automatically detect warning signs of equipment failure before they happen (e.g., compressor anomalies)."),
        ("Maintenance Scheduling","Track predictive, preventive, and corrective maintenance tasks assigned to engineers."),
        ("Alerts & Interventions","Generate AI-driven alerts for impending breakdowns and suggest repair recommendations."),
        ("Multi-tenant Dashboard","A fully reactive SPA with glassmorphism design for managing equipment across multiple facilities."),
    ]
    story.append(tbl(["Objective","Description"], objs, [5*cm, 12*cm]))

def s2_problem(story):
    story.append(sp(10))
    story.append(sec("2. Problem Statement & Business Impact"))
    story.append(body(
        "Unexpected equipment failure (HVAC units, generators, pumps) is one of the highest costs in facility management. "
        "Traditional 'preventive' maintenance replaces parts too early, while 'reactive' maintenance waits for costly breakdowns."
    ))
    story.append(sp(6))
    story.append(tbl(
        ["Challenge","Traditional Approach","Our Solution"],
        [
            ["Asset Visibility","Clipboard inspections","Live digital twin dashboard"],
            ["Maintenance Timing","Calendar-based (Fixed schedule)","Condition-based (AI Predictive)"],
            ["Downtime Prevention","Wait for breakdown","Detect degradation days in advance"],
            ["Lifecycle Tracking","Spreadsheets","Automated health scores & runtime"],
            ["Task Management","Paper work-orders","Digital schedules & AI alerts"],
        ],
        [5.5*cm, 5.5*cm, 6*cm]
    ))
    story.append(sp(6))
    story.append(hi(
        "Business Impact: Moving from reactive to AI predictive maintenance can reduce unplanned downtime by 30-50% "
        "and increase equipment lifespan by 20%, saving tens of thousands of dollars annually."
    ))

def s3_tech(story):
    story.append(PageBreak())
    story.append(sec("3. Technology Stack"))
    story.append(sub("3.1 Backend"))
    story.append(tbl(
        ["Technology","Version","License","Purpose"],
        [
            ["Python","3.11+","PSF (Free)","Core programming language"],
            ["FastAPI",">=0.110","MIT","REST API web framework with auto Swagger docs"],
            ["SQLAlchemy ORM",">=2.0","MIT","Database ORM — write Python instead of SQL"],
            ["Pydantic",">=2.6","MIT","Automatic request/response data validation"],
            ["Pandas",">=2.2","BSD","Vectorised analytics and CSV data processing"],
            ["NumPy",">=1.26","BSD","Statistical generation for Azure PdM Dataset"],
            ["ReportLab",">=4.1","BSD","PDF audit report generation"],
            ["OpenPyXL",">=3.1","MIT","Excel (.xlsx) report generation"],
            ["Uvicorn",">=0.28","BSD","ASGI server for FastAPI"],
        ],
        [3.5*cm, 2.5*cm, 2.5*cm, 8.5*cm]
    ))
    story.append(sp(8))
    story.append(sub("3.2 Frontend"))
    story.append(tbl(
        ["Technology","Version","License","Purpose"],
        [
            ["React","v19","MIT","Component-based UI framework"],
            ["Vite","v6.4","MIT","Ultra-fast dev server and production build tool"],
            ["Tailwind CSS","v4","MIT","Utility-first CSS — all styling via class names"],
            ["Chart.js","v4.4","MIT","Canvas-based interactive charting engine"],
            ["React-ChartJS-2","v5.3","MIT","React wrapper for Chart.js components"],
            ["React Router","v7","MIT","Client-side SPA routing (no page reloads)"],
            ["Axios","v1.7","MIT","HTTP client for API communication"],
            ["Lucide React","v0.475","ISC","Professional SVG icon library"],
        ],
        [3.5*cm, 2.5*cm, 2.5*cm, 8.5*cm]
    ))
    story.append(sp(8))
    story.append(sub("3.3 Database"))
    story.append(tbl(
        ["Database","Use Case","License"],
        [
            ["SQLite","Local development — zero config, file-based (facilityops.db)","Public Domain"],
            ["PostgreSQL","Production — enterprise RDBMS via DATABASE_URL env variable","PostgreSQL License"],
        ],
        [3.5*cm, 11*cm, 2.5*cm]
    ))

def s4_arch(story):
    story.append(PageBreak())
    story.append(sec("4. System Architecture"))
    story.append(body(
        "The platform follows a clean <b>three-tier architecture</b>. The Maintenance module introduces "
        "a new set of Agents and Services that work alongside the Energy Module, sharing the same DB."
    ))
    story.append(sp(8))
    story.append(code(
        "PRESENTATION LAYER  (React 19 + Vite + Tailwind CSS)\n"
        "  PM Dashboard | Equipment | Health Scores | Predictions | Schedule | PM Alerts\n"
        "                              | HTTP REST (Axios)\n"
        "APPLICATION LAYER  (FastAPI Python)\n"
        "  API Routers: /maintenance/*  /equipment/*\n"
        "      |                                    |\n"
        "  AI Maintenance Agent             Maintenance Service\n"
        "  Predictive Rule Engine           Health Scoring Logic\n"
        "  Anomaly Detector                 Schedule Generator\n"
        "                              | SQLAlchemy ORM\n"
        "DATA LAYER  (SQLite / PostgreSQL)\n"
        "  Tables: equipment  |  maintenance_monitoring  |  maintenance_alerts | schedule\n"
        "                              ^\n"
        "IoT DATA SOURCE LAYER\n"
        "  Microsoft Azure Predictive Maintenance Dataset (PdM CSVs)"
    ))

def s5_db(story):
    story.append(PageBreak())
    story.append(sec("5. Database Design"))
    story.append(sub("Table 1: equipment  (100 machines from Azure dataset)"))
    story.append(tbl(
        ["Column","Type","Constraint","Description"],
        [
            ["equipment_id","INTEGER","PRIMARY KEY","Matches machineID (1-100)"],
            ["facility_id","VARCHAR(50)","FK","Facility mapping"],
            ["equipment_name","VARCHAR(150)","NOT NULL","Name of asset"],
            ["equipment_type","VARCHAR(100)","NOT NULL","model1..model4"],
            ["status","VARCHAR(50)","DEFAULT Operational","Operational / Under Maintenance"],
            ["expected_life_years","INTEGER","—","Mapped from Azure 'age' field"],
        ],
        [3.5*cm, 3*cm, 3.5*cm, 7*cm]
    ))
    story.append(sp(8))
    story.append(sub("Table 2: maintenance_monitoring  (~72,000+ IoT telemetry rows)"))
    story.append(tbl(
        ["Column","Type","Description"],
        [
            ["monitoring_id","INTEGER (PK)","Auto-incrementing primary key"],
            ["equipment_id","INTEGER FK","Foreign key → equipment.equipment_id"],
            ["timestamp","DATETIME","Hourly IoT sensor reading timestamp"],
            ["power_consumption","FLOAT","Mapped from Azure 'volt'"],
            ["vibration","FLOAT","Mapped from Azure 'vibration'"],
            ["pressure","FLOAT","Mapped from Azure 'pressure'"],
            ["runtime_hours","FLOAT","Cumulative runtime"],
            ["operating_status","VARCHAR(50)","Running | Idle | Fault"],
        ],
        [4.5*cm, 3*cm, 9.5*cm]
    ))
    story.append(sp(8))
    story.append(sub("Table 3: maintenance_alerts  &  maintenance_schedule"))
    story.append(tbl(
        ["Table","Key Columns","Description"],
        [
            ["maintenance_alerts","alert_id, equipment_id, issue, severity, status",
             "Populated by Azure PdM_errors.csv (Medium severity) and PdM_failures.csv (Critical)"],
            ["maintenance_schedule","schedule_id, next_service_date, maintenance_type, status",
             "Populated by Azure PdM_maint.csv (Component replacements)"],
        ],
        [4.5*cm, 4.5*cm, 8*cm]
    ))

def s6_backend(story):
    story.append(PageBreak())
    story.append(sec("6. Backend — FastAPI Application"))
    story.append(body(
        "The backend auto-seeds the predictive maintenance data on startup by running the "
        "<b>generate_pdm_dataset.py</b> generator or downloading the Azure CSVs directly, injecting them into the DB."
    ))
    story.append(sp(6))
    story.append(sub("Folder Structure (Maintenance Extensions)"))
    story.append(code(
        "backend/\n"
        "  app/\n"
        "    models/\n"
        "      equipment.py            Equipment, MaintenanceMonitoring, Alerts, Schedules\n"
        "    api/\n"
        "      maintenance.py          GET /api/maintenance/dashboard, /api/equipment\n"
        "    services/\n"
        "      maintenance_seed_service.py   Loads PdM CSVs into the ORM on startup\n"
        "      replay_service.py             Background daemon simulating live IoT traffic\n"
        "  data/pdm/\n"
        "    PdM_machines.csv\n"
        "    PdM_telemetry.csv         (72,000 hourly rows)\n"
        "    PdM_errors.csv\n"
        "    PdM_failures.csv\n"
        "    PdM_maint.csv\n"
        "  generate_pdm_dataset.py     Generates faithful Azure PdM dataset offline"
    ))

def s7_agent(story):
    story.append(PageBreak())
    story.append(sec("7. AI Maintenance Agent — Health & Predictions"))
    story.append(body(
        "The <b>AI Maintenance Agent</b> continuously evaluates telemetry streams to assign Health Scores "
        "and predict failure probability."
    ))
    story.append(sp(6))
    story.append(sub("7.1 Health Score Algorithm"))
    story.append(body(
        "Each machine starts with a base score of 100. The agent subtracts points based on:"
    ))
    for i,s in enumerate([
        "Active Critical Alerts: -20 points per alert.",
        "Active High/Medium Alerts: -10 to -5 points per alert.",
        "Overdue Maintenance: -15 points if a scheduled service is missed.",
        "Vibration/Pressure Spikes: -2 to -5 points for recent telemetry deviations.",
    ], 1):
        story.append(bul(f"<b>{i}.</b> {s}"))
    story.append(sp(8))
    story.append(sub("7.2 Predictive Inference"))
    story.append(tbl(
        ["Trigger Condition","Inference Output","Recommended Action"],
        [
            ["Vibration > 2 Std Devs","Bearing wear detected","Inspect motor bearings immediately"],
            ["Pressure Drop + Volt Spike","Pump cavitation / Seal leak","Schedule pump maintenance"],
            ["Repeated Error1 + Error2","High breakdown probability (85%)","Proactive component replacement"],
            ["Age > 15 yrs + High Load","End of lifecycle approaching","Budget for capital replacement"],
        ],
        [4.5*cm, 6.5*cm, 6*cm]
    ))

def s8_analytics(story):
    story.append(PageBreak())
    story.append(sec("8. Analytics & Scoring Engine"))
    story.append(body(
        "The Pandas-powered analytics engine aggregates the vast telemetry data into human-readable KPIs."
    ))
    story.append(sp(6))
    story.append(tbl(
        ["Metric","Calculation","Used In"],
        [
            ["Overall Equipment Health","Average of all equipment health scores","PM Dashboard KPI"],
            ["Machines at Risk","Count where health_score < 70","PM Dashboard KPI"],
            ["Active PM Alerts","Count of unresolved alerts in maintenance_alerts","PM Dashboard KPI"],
            ["Upcoming Schedules","Count of maintenance_schedule in next 7 days","PM Dashboard KPI"],
            ["Historical Health Trend","Daily average health score over 30 days","Line Chart"],
            ["Downtime Risk Distribution","Bucket machines into Low/Med/High risk","Doughnut Chart"],
            ["Telemetry Timeseries","Plot 24h pressure/vibration/volt traces","Equipment Details"],
        ],
        [5*cm, 7*cm, 5*cm]
    ))

def s9_api(story):
    story.append(PageBreak())
    story.append(sec("9. REST API Endpoints"))
    story.append(body(
        "All endpoints at <b>http://localhost:8000</b>. "
    ))
    story.append(sp(6))
    story.append(tbl(
        ["Method","Endpoint","Description"],
        [
            ["GET","/api/maintenance/dashboard","Aggregated stats: Health avg, at-risk count, active alerts"],
            ["GET","/api/equipment","List all equipment, filter by facility_id"],
            ["GET","/api/equipment/{id}","Get specific equipment details + 30-day telemetry"],
            ["GET","/api/maintenance/alerts","Fetch active predictive alerts"],
            ["PATCH","/api/maintenance/alerts/{id}","Acknowledge or Resolve an alert"],
            ["GET","/api/maintenance/schedule","Fetch upcoming preventive/corrective schedules"],
        ],
        [2*cm, 6.5*cm, 8.5*cm]
    ))

def s10_frontend(story):
    story.append(PageBreak())
    story.append(sec("10. Frontend — React Dashboard"))
    story.append(body(
        "The frontend uses an accordion-style collapsible sidebar to cleanly separate the <b>Energy Agent</b> "
        "and <b>Maintenance Agent</b> modules."
    ))
    story.append(sp(6))
    story.append(sub("Reusable UI Components"))
    story.append(tbl(
        ["Component","File","Purpose"],
        [
            ["<Sidebar />","layout/Sidebar.jsx","2-row accordion layout, auto-expands based on route"],
            ["<EquipmentCard />","maintenance/EquipmentCard.jsx","Displays machine info, health score radial, and status badge"],
            ["<HealthGauge />","maintenance/HealthGauge.jsx","Circular progress bar (Green/Yellow/Red) for health score"],
            ["<AlertList />","maintenance/AlertList.jsx","Interactive list to manage and acknowledge PM alerts"],
        ],
        [3.5*cm, 5.5*cm, 8*cm]
    ))

def s11_pages(story):
    story.append(PageBreak())
    story.append(sec("11. Dashboard Pages & Features"))
    pages = [
        ("/maintenance  PM Dashboard","Executive overview for maintenance. KPIs: Avg Health, Machines at Risk, Active Alerts. "
          "Charts: 30-day Health Trend, Risk Distribution, Facility-wise comparison."),
        ("/maintenance/equipment  Equipment","Inventory view of all machines. Displays age, type, location, and real-time health score. "
          "Clicking a machine opens detailed telemetry traces."),
        ("/maintenance/health  Health Scores","Deep dive into the health scoring algorithm. Shows leaderboards for most healthy and least healthy assets. "
          "Provides AI reasoning for point deductions."),
        ("/maintenance/predictions  Predictions","AI inference hub. Displays equipment with high probability of failure in the next 7-30 days based on telemetry anomalies."),
        ("/maintenance/schedule  Schedule","Calendar and list view of upcoming maintenance tasks. Filter by Preventive, Corrective, or Predictive type."),
        ("/maintenance/alerts  PM Alerts","Inbox for AI-generated warnings (Vibration Spikes, Pressure Drops, Error Codes). "
          "Engineers can update status to In Progress or Resolved."),
    ]
    for route, desc in pages:
        story.append(KeepTogether([
            sub(route),
            body(desc),
            sp(4),
        ]))

def s12_data(story):
    story.append(PageBreak())
    story.append(sec("12. Data Simulation & Microsoft Azure Dataset"))
    story.append(body(
        "Instead of random data, this module leverages the real-world <b>Microsoft Azure Predictive Maintenance</b> dataset "
        "from Kaggle. A local script replicates the exact schema and statistical distributions of the dataset, providing highly realistic telemetry."
    ))
    story.append(sp(6))
    story.append(tbl(
        ["File","Rows","Description"],
        [
            ["PdM_machines.csv","100","100 machines (model1..model4) with ages"],
            ["PdM_telemetry.csv","72,000+","Hourly voltage, rotation, pressure, vibration"],
            ["PdM_errors.csv","~3,919","Non-failure error events logged during operation"],
            ["PdM_failures.csv","~761","Component failure events (critical)"],
            ["PdM_maint.csv","~3,286","Component replacement/maintenance records"],
        ],
        [3.5*cm, 2.5*cm, 11*cm]
    ))
    story.append(sp(6))
    story.append(hi(
        "Live Replay Service: A background daemon (replay_service.py) reads the CSVs and inserts rows "
        "every 15 seconds to simulate real-time live IoT streaming for demos."
    ))

def s13_reports(story):
    story.append(sp(10))
    story.append(sec("13. Report Export Engine"))
    story.append(tbl(
        ["Format","Library Used","Content"],
        [
            ["CSV",      "Python csv module",  "Raw equipment list or maintenance logs"],
            ["Excel (.xlsx)","OpenPyXL >= 3.1","Formatted health score reports and upcoming schedules"],
            ["PDF",      "ReportLab >= 4.1","Formal maintenance audit document with downtime stats"],
        ],
        [3*cm, 4*cm, 10*cm]
    ))

def s14_licenses(story):
    story.append(sp(10))
    story.append(sec("14. Licenses & Open Source"))
    story.append(hi(
        "All tools, frameworks, and libraries are 100% free and open-source (MIT / BSD / PostgreSQL licenses). "
        "The Azure Predictive Maintenance dataset is provided openly for ML experimentation."
    ))

def s15_run(story):
    story.append(PageBreak())
    story.append(sec("15. How to Run the Application"))
    story.append(sub("Prerequisites"))
    for p in ["Python 3.11+","Node.js 18+ and npm"]:
        story.append(bul(p))
    story.append(sp(8))
    story.append(sub("Start Backend (FastAPI)"))
    story.append(sp(4))
    story.append(dark_code("cd backend\npython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"))
    story.append(sp(4))
    story.append(body("The backend will auto-generate the Azure PdM dataset on first boot (takes ~5 seconds) and seed the DB."))
    story.append(sp(10))
    story.append(sub("Start Frontend (React + Vite)"))
    story.append(sp(4))
    story.append(dark_code("cd frontend\nnpm run dev"))
    story.append(sp(4))
    story.append(body("Dashboard available at: http://localhost:5173"))
    story.append(sp(8))
    story.append(sub("Demo Mode / Live IoT Streaming"))
    story.append(body("Enable REPLAY_MODE in backend/.env to simulate live telemetry inserts every 15 seconds."))

def s16_roadmap(story):
    story.append(sp(10))
    story.append(sec("16. Future Roadmap"))
    story.append(tbl(
        ["Module","Description","Status"],
        [
            ["Energy Intelligence & Monitoring","Real-time IoT telemetry, AI anomaly detection","ACTIVE"],
            ["Predictive Maintenance","ML-based equipment failure prediction, health scores","ACTIVE"],
            ["Occupancy & Space Optimization","People-count analytics, zone utilisation","Upcoming"],
            ["Security & Anomaly Intelligence","Access control monitoring, CCTV event classification","Upcoming"],
            ["Cost Intelligence & Billing","Tariff analysis, demand charge optimisation","Upcoming"],
        ],
        [5*cm, 9.5*cm, 2.5*cm]
    ))
    story.append(sp(12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=CYAN, spaceAfter=8))
    story.append(body(
        "<b>End of Documentation</b>  —  Agentic AI For Smart Facility Operations And Optimizations v1.0  |  Predictive Maintenance Module"
    ))
    story.append(body(f"Document generated: {datetime.datetime.now().strftime('%d %B %Y, %I:%M %p')}"))

# ──────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────
def build():
    doc = SimpleDocTemplate(
        OUTPUT_PDF, pagesize=A4,
        leftMargin=1.8*cm, rightMargin=1.8*cm,
        topMargin=2.2*cm, bottomMargin=2.0*cm,
        title="Agentic AI For Smart Facility Operations And Optimizations PM Documentation",
        author="G Vinay Kumar",
        subject="Predictive Maintenance Module — Technical Documentation",
    )
    story = []
    cover(story)
    toc(story)
    s1_overview(story)
    s2_problem(story)
    s3_tech(story)
    s4_arch(story)
    s5_db(story)
    s6_backend(story)
    s7_agent(story)
    s8_analytics(story)
    s9_api(story)
    s10_frontend(story)
    s11_pages(story)
    s12_data(story)
    s13_reports(story)
    s14_licenses(story)
    s15_run(story)
    s16_roadmap(story)
    doc.build(story, onFirstPage=hdr_ftr, onLaterPages=hdr_ftr)
    print(f"\n PDF generated: {OUTPUT_PDF}\n")

if __name__ == "__main__":
    build()
