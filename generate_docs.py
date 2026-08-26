"""
Agentic AI For Smart Facility Operations And Optimizations
Project Documentation Generator — PDF
Uses ReportLab to produce a professional, formatted PDF report.
Run: python generate_docs.py
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
OUTPUT_PDF = os.path.join(os.path.dirname(__file__), "Smart Facility Operations_AI_Platform_Documentation.pdf")

# ──────────────────────────────────────────────────────────
# Colour palette
# ──────────────────────────────────────────────────────────
DARK_BLUE  = colors.HexColor("#0F172A")
MID_BLUE   = colors.HexColor("#1E3A5F")
CYAN       = colors.HexColor("#06B6D4")
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
SHL= S("shl",fontName="Helvetica-Bold", fontSize=9.5, textColor=colors.HexColor("#0F4C81"),
        backColor=colors.HexColor("#DBEAFE"), borderPadding=(5,7,5,7), spaceAfter=6, leading=14, leftIndent=8)
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
        S("cd", fontName="Courier", fontSize=8, textColor=colors.HexColor("#0F4C81"),
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
    c.drawRightString(w-1.2*cm, h-18, "Energy Intelligence & Monitoring — Documentation")
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
        [Paragraph("Energy Intelligence &amp; Monitoring",
            S("cs", fontName="Helvetica-Bold", fontSize=15, textColor=CYAN,
              alignment=TA_CENTER, spaceAfter=4))],
        [Paragraph("Technical Project Documentation",
            S("cc", fontName="Helvetica", fontSize=11, textColor=SLATE_500,
              alignment=TA_CENTER, spaceAfter=8))],
        [HRFlowable(width="50%", thickness=2, color=CYAN, spaceAfter=10, hAlign="CENTER")],
        [sp(8)],
        [Paragraph("Version 1.0  |  Energy Intelligence Module",
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
        ("7","AI Energy Agent — Rule Engine","8"),
        ("8","Analytics Engine","9"),
        ("9","REST API Endpoints","10"),
        ("10","Frontend — React Dashboard","11"),
        ("11","Dashboard Pages & Features","12"),
        ("12","Data Simulation & CSV Layer","14"),
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
        "Energy Intelligence and Monitoring system for commercial buildings such as IT Parks, Hospitals, "
        "Universities, Shopping Malls, and Factories. The platform collects energy consumption data from "
        "IoT sensors (simulated via CSV files), analyses energy usage using Python data science tools, "
        "detects abnormal consumption through an AI rule engine, generates intelligent recommendations, "
        "and visualises everything through a real-time professional dashboard similar to "
        "Microsoft Azure Monitor, AWS CloudWatch, or Grafana."
    ))
    story.append(sp(6))
    story.append(sub("1.1 Core Objectives"))
    objs = [
        ("Real-Time Monitoring","Collect and display hourly electricity, water, HVAC, solar, and power factor sensor readings."),
        ("AI Anomaly Detection","Automatically detect energy spikes, HVAC overloads, power factor drops, night anomalies, and water leaks."),
        ("Intelligent Recommendations","Generate prioritised energy-saving action plans with estimated kWh and cost savings."),
        ("Analytics & KPIs","Compute carbon footprint, efficiency score, peak demand hours, and facility-wise comparisons."),
        ("Report Export","Export audit-ready reports in CSV, Excel (.xlsx), and PDF formats."),
        ("Scalable Architecture","Designed to extend to Maintenance, Occupancy, Security, and Cost Intelligence modules."),
    ]
    story.append(tbl(["Objective","Description"], objs, [5*cm, 12*cm]))

def s2_problem(story):
    story.append(sp(10))
    story.append(sec("2. Problem Statement & Business Impact"))
    story.append(body(
        "Commercial buildings consume <b>40–60% of all electricity produced globally</b>. "
        "Most facility managers have no real-time visibility into energy patterns, no automated alerts "
        "for anomalies, and no AI-driven guidance for reduction — relying only on monthly billing reports."
    ))
    story.append(sp(6))
    story.append(tbl(
        ["Challenge","Traditional Approach","Our Solution"],
        [
            ["Real-time visibility","Monthly utility bills","Live IoT telemetry dashboard"],
            ["Anomaly detection","Manual inspection (delayed)","AI Agent auto-detects within the hour"],
            ["Energy optimisation","Expensive consultant reports","Automated AI recommendations with savings"],
            ["Multi-facility comparison","Manual spreadsheets","Automated benchmark comparison matrix"],
            ["Compliance reporting","Manual data collection","One-click CSV / Excel / PDF export"],
        ],
        [5.5*cm, 5.5*cm, 6*cm]
    ))
    story.append(sp(6))
    story.append(hi(
        "Business Impact: AI-driven energy monitoring can reduce electricity bills by 10-25% per facility, "
        "equivalent to Rs.5-20 Lakh savings annually per large commercial building."
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
            ["NumPy",">=1.26","BSD","Numerical computations for baseline calculations"],
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
        "The platform follows a clean <b>three-tier architecture</b>: Presentation Layer (React frontend), "
        "Application/Business Logic Layer (FastAPI + AI Agent + Analytics Engine), and Data Layer "
        "(SQLite/PostgreSQL). The layers communicate strictly through the REST API contract."
    ))
    story.append(sp(8))
    story.append(code(
        "PRESENTATION LAYER  (React 19 + Vite + Tailwind CSS)\n"
        "  Dashboard | Energy Monitoring | Analytics | Alerts | Recommendations | Reports | Settings\n"
        "                              | HTTP REST (Axios)\n"
        "APPLICATION LAYER  (FastAPI Python)\n"
        "  API Routers: /facilities  /energy  /analytics  /alerts  /recommendations  /reports\n"
        "      |                                    |\n"
        "  AI Energy Agent                  Analytics Service\n"
        "  Rule Engine (5 rules)            Pandas + NumPy (15+ KPI metrics)\n"
        "  Recommendations Engine           Carbon footprint / Efficiency score\n"
        "                              | SQLAlchemy ORM\n"
        "DATA LAYER  (SQLite / PostgreSQL)\n"
        "  Tables: facilities  |  energy_usage  |  energy_alerts\n"
        "                              ^\n"
        "IoT DATA SOURCE LAYER\n"
        "  CSV Simulation (current)  -->  MQTT/WebSocket IoT Sensors (future)"
    ))

def s5_db(story):
    story.append(PageBreak())
    story.append(sec("5. Database Design"))
    story.append(sub("Table 1: facilities"))
    story.append(tbl(
        ["Column","Type","Constraint","Description"],
        [
            ["facility_id","VARCHAR(50)","PRIMARY KEY","Unique ID (e.g., FAC-001)"],
            ["facility_name","VARCHAR(150)","NOT NULL","Full building name"],
            ["facility_type","VARCHAR(100)","NOT NULL","IT Park / Hospital / University / Shopping Mall / Factory"],
            ["city","VARCHAR(100)","NOT NULL","City location"],
            ["state","VARCHAR(100)","NOT NULL","State/Province"],
            ["total_floors","INTEGER","DEFAULT 1","Number of floors"],
            ["total_area_sqft","FLOAT","DEFAULT 10000","Total area in sq.ft"],
        ],
        [3.5*cm, 3*cm, 3.5*cm, 7*cm]
    ))
    story.append(sp(8))
    story.append(sub("Table 2: energy_usage  (18,000+ IoT records)"))
    story.append(tbl(
        ["Column","Type","Description"],
        [
            ["energy_id","INTEGER (PK)","Auto-incrementing primary key"],
            ["facility_id","VARCHAR(50) FK","Foreign key → facilities.facility_id"],
            ["timestamp","DATETIME","Hourly IoT sensor reading timestamp"],
            ["electricity_kwh","FLOAT","Total electricity consumed (kWh)"],
            ["water_liters","FLOAT","Water consumption (litres/hr)"],
            ["hvac_kwh","FLOAT","HVAC system electricity usage (kWh)"],
            ["lighting_kwh","FLOAT","Lighting electricity usage (kWh)"],
            ["solar_generation_kwh","FLOAT","Rooftop PV solar generation (kWh)"],
            ["power_factor","FLOAT","Electrical power factor (cos phi, 0-1)"],
            ["temperature","FLOAT","Ambient temperature (degrees C)"],
            ["humidity","FLOAT","Relative humidity (%)"],
        ],
        [4.5*cm, 4*cm, 8.5*cm]
    ))
    story.append(sp(8))
    story.append(sub("Table 3: energy_alerts  (AI-Generated)"))
    story.append(tbl(
        ["Column","Type","Description"],
        [
            ["alert_id","INTEGER (PK)","Auto-incrementing primary key"],
            ["facility_id","VARCHAR(50) FK","Foreign key → facilities.facility_id"],
            ["timestamp","DATETIME","When the anomaly was detected"],
            ["severity","VARCHAR(20)","Critical | High | Medium | Low"],
            ["alert_type","VARCHAR(100)","High Energy Consumption / HVAC Overload / Power Spike / Water Leakage / Abnormal Night Usage"],
            ["message","TEXT","Data-driven incident description"],
            ["recommendation","TEXT","AI-generated action recommendation text"],
            ["status","VARCHAR(20)","Open | In Progress | Resolved"],
        ],
        [4.5*cm, 4*cm, 8.5*cm]
    ))

def s6_backend(story):
    story.append(PageBreak())
    story.append(sec("6. Backend — FastAPI Application"))
    story.append(body(
        "The backend follows <b>Clean Architecture</b> principles — separated into Models, Schemas, "
        "Agents, Services, and API layers. On startup it auto-creates tables and seeds 18,000+ records."
    ))
    story.append(sp(6))
    story.append(sub("Startup Sequence"))
    for i,s in enumerate([
        "FastAPI instantiated with CORS middleware.",
        "SQLAlchemy creates all DB tables if they don't exist.",
        "data_service.py generates CSV files (30 days × 5 facilities = 18,000+ hourly records).",
        "Database seeded from CSV if tables are empty.",
        "All API routers mounted under /api prefix.",
        "Uvicorn serves on http://0.0.0.0:8000.",
    ], 1):
        story.append(bul(f"<b>Step {i}:</b> {s}"))
    story.append(sp(8))
    story.append(sub("Folder Structure"))
    story.append(code(
        "backend/\n"
        "  app/\n"
        "    main.py                   FastAPI entry point, startup lifecycle\n"
        "    core/\n"
        "      config.py               Pydantic Settings (env vars, thresholds)\n"
        "      database.py             SQLAlchemy engine and session factory\n"
        "    models/\n"
        "      facility.py             Facility ORM model\n"
        "      energy.py               EnergyUsage ORM model\n"
        "      alert.py                EnergyAlert ORM model\n"
        "    schemas/                  Pydantic request/response validation schemas\n"
        "    api/\n"
        "      facilities.py           GET /api/facilities\n"
        "      energy.py               GET + POST /api/energy\n"
        "      analytics.py            GET /api/analytics\n"
        "      alerts.py               GET + PATCH /api/alerts\n"
        "      recommendations.py      GET /api/recommendations\n"
        "      reports.py              GET /api/reports/export\n"
        "    agents/\n"
        "      energy_agent.py         AI rule engine + recommendations generator\n"
        "    services/\n"
        "      analytics_service.py    Pandas analytics engine (15+ metrics)\n"
        "      data_service.py         CSV generator and DB seeder\n"
        "  data/\n"
        "    sample_facilities.csv\n"
        "    sample_energy_data.csv"
    ))

def s7_agent(story):
    story.append(PageBreak())
    story.append(sec("7. AI Energy Agent — Rule Engine"))
    story.append(body(
        "The <b>AI Energy Agent</b> (energy_agent.py) is the intelligence core. It runs automatically "
        "when new telemetry is ingested (POST /api/energy) or when alerts are fetched. It uses a "
        "statistical baseline approach combined with rule-based anomaly detection."
    ))
    story.append(sp(6))
    story.append(sub("7.1 How the Agent Works (Step by Step)"))
    for i,s in enumerate([
        "Loads last 720 hours (30 days) of hourly records for each facility from the database.",
        "Converts to Pandas DataFrame, sorts chronologically, extracts hour-of-day column.",
        "Groups by hour-of-day to compute the 7-day hourly baseline (statistical mean).",
        "Retrieves the most recent record as the subject for evaluation.",
        "Applies 5 detection rules sequentially.",
        "Deduplication: same alert type per facility won't re-fire within 12 hours.",
        "Saves new alerts to energy_alerts table and commits the session.",
    ], 1):
        story.append(bul(f"<b>{i}.</b> {s}"))
    story.append(sp(8))
    story.append(sub("7.2 Detection Rules"))
    story.append(tbl(
        ["Rule #","Rule Name","Condition","Severity","Alert Type"],
        [
            ["Rule 1","Energy Spike","Electricity > 20% above 7-day hourly baseline","High / Critical (>40%)","High Energy Consumption"],
            ["Rule 2","HVAC Overload","HVAC kWh > 50% of total facility electricity","High","HVAC Overload"],
            ["Rule 3","Power Factor Drop","Power Factor < 0.90 (utility penalty threshold)","Medium","Power Spike"],
            ["Rule 4","Night Anomaly","Off-hours (23:00-05:00) consumption > 65% of daytime avg","Medium","Abnormal Night Usage"],
            ["Rule 5","Water Leakage","Night water flow > 1.5x facility average","Critical","Water Leakage"],
        ],
        [1.5*cm, 3*cm, 5.5*cm, 3*cm, 4*cm]
    ))
    story.append(sp(8))
    story.append(sub("7.3 AI Recommendations Engine"))
    story.append(body(
        "Analyses 7-day patterns to generate prioritised energy-saving recommendations. "
        "Each includes: Priority, Est. Cost Savings (USD/month), Est. Energy Savings (kWh), Root Cause, Suggested Action."
    ))
    story.append(tbl(
        ["Recommendation Title","Trigger","Category","Priority"],
        [
            ["Optimize HVAC Thermostat & Reset Setpoint","HVAC > 46% of total load","HVAC","High"],
            ["Automate After-Hours Lighting Shutdown","Night lighting high","Lighting","Medium"],
            ["Install APFC Capacitor Banks","Avg Power Factor < 0.92","Power Factor","High/Medium"],
            ["Solar PV Panel Cleaning & Inspection","Solar generation present","Solar","Low"],
        ],
        [6*cm, 5*cm, 3*cm, 3*cm]
    ))

def s8_analytics(story):
    story.append(PageBreak())
    story.append(sec("8. Analytics Engine"))
    story.append(body(
        "The analytics service uses <b>Pandas vectorised operations</b> to compute 15+ metrics "
        "from database records. Powers all KPI cards, charts, and tables on the dashboard."
    ))
    story.append(sp(6))
    story.append(tbl(
        ["Metric","Calculation","Used In"],
        [
            ["Total Electricity (kWh)","df['electricity_kwh'].sum()","KPI Card"],
            ["Today vs Yesterday %","((today-yesterday)/yesterday)*100","KPI trend arrow"],
            ["Average Hourly kWh","df['electricity_kwh'].mean()","KPI sub-text"],
            ["Peak Consumption Hour","hourly_grp.idxmax() on groupby hour","Analytics heatmap"],
            ["Energy Efficiency Score","95 - PF penalty - HVAC ratio penalty (0-100 scale)","KPI & comparison table"],
            ["Carbon Footprint (Tons CO2e)","total_kWh x 0.82 kg/kWh / 1000","Analytics & KPI card"],
            ["Hourly Trend (24h)","Last 24 hours individual records","Line chart"],
            ["Daily Trend (7 days)","groupby(date).sum().tail(7)","Bar chart"],
            ["Monthly Trend (30 days)","groupby(date).sum().tail(30)","Area chart"],
            ["Category Breakdown %","HVAC% + Lighting% + Equipment% + Solar%","Doughnut chart"],
            ["Facility Comparison","groupby(facility_id) aggregate all metrics","Bar chart & matrix table"],
            ["24-Hour Peak Heatmap","Mean kWh per hour 00:00-23:00","Analytics heatmap grid"],
            ["Active & Critical Alert Count","COUNT WHERE status != Resolved","KPI Card"],
        ],
        [5.5*cm, 6.5*cm, 5*cm]
    ))
    story.append(sp(6))
    story.append(hi(
        "Efficiency Score Formula:  Score = max(50, min(98, 95 - max(0, (0.95 - avg_pf) x 100) "
        "- max(0, (hvac_ratio - 0.45) x 50)))     |     Grid Emission Factor: 0.82 kg CO2/kWh"
    ))

def s9_api(story):
    story.append(PageBreak())
    story.append(sec("9. REST API Endpoints"))
    story.append(body(
        "All endpoints at <b>http://localhost:8000</b>. "
        "Swagger UI auto-generated at <b>http://localhost:8000/docs</b>."
    ))
    story.append(sp(6))
    story.append(tbl(
        ["Method","Endpoint","Description","Query Params"],
        [
            ["GET","/api/facilities","List all commercial facilities","—"],
            ["GET","/api/energy","Fetch energy telemetry records","facility_id, limit"],
            ["GET","/api/energy/{facility_id}","Fetch records for one facility","limit"],
            ["POST","/api/energy","Ingest new IoT reading; triggers AI Agent","JSON body"],
            ["GET","/api/analytics","Full analytics computation (15+ metrics)","facility_id, start_date, end_date"],
            ["GET","/api/alerts","Get AI-generated energy alerts","facility_id, severity, status"],
            ["PATCH","/api/alerts/{id}/status","Update alert status","Body: {status}"],
            ["GET","/api/recommendations","Get prioritised AI recommendations","facility_id"],
            ["GET","/api/reports/export","Download audit report file","format, facility_id"],
        ],
        [2*cm, 5*cm, 6*cm, 4*cm]
    ))

def s10_frontend(story):
    story.append(PageBreak())
    story.append(sec("10. Frontend — React Dashboard"))
    story.append(body(
        "Single-page application built with <b>React 19 + Vite + Tailwind CSS</b>. "
        "Follows a component-driven architecture. Design inspired by Microsoft Azure Portal — "
        "dark glassmorphism cards, top navbar with global facility selector, fixed left sidebar."
    ))
    story.append(sp(6))
    story.append(sub("Reusable UI Components"))
    story.append(tbl(
        ["Component","File","Purpose"],
        [
            ["<Navbar />","layout/Navbar.jsx","Logo, facility dropdown, alert badge, theme toggle"],
            ["<Sidebar />","layout/Sidebar.jsx","7 nav items, active highlighting, AI Engine status panel"],
            ["<GlassCard />","common/GlassCard.jsx","Glassmorphism container with title, subtitle, action slot"],
            ["<KpiCard />","common/KpiCard.jsx","Metric card with value, unit, trend %, icon, sub-text"],
            ["<HourlyLineChart />","charts/HourlyLineChart.jsx","24h multi-line telemetry chart (Chart.js Line)"],
            ["<WeeklyBarChart />","charts/WeeklyBarChart.jsx","7-day grouped bar chart (Chart.js Bar)"],
            ["<CategoryPieChart />","charts/CategoryPieChart.jsx","End-use category doughnut chart"],
            ["<FacilityBarChart />","charts/FacilityBarChart.jsx","Facility comparison bar chart"],
            ["<MonthlyAreaChart />","charts/MonthlyAreaChart.jsx","30-day area trend + solar overlay"],
            ["<IngestDataModal />","common/IngestDataModal.jsx","Modal form to POST new IoT readings"],
        ],
        [3.5*cm, 5*cm, 8.5*cm]
    ))
    story.append(sp(6))
    story.append(sub("Global State — React Context API"))
    story.append(body(
        "FacilityContext provides: selectedFacilityId (updates all pages when changed), theme (dark/light), "
        "facilities list (dropdown), refreshTrigger (forces data re-fetch), isIngestModalOpen."
    ))

def s11_pages(story):
    story.append(PageBreak())
    story.append(sec("11. Dashboard Pages & Features"))
    pages = [
        ("/  Dashboard","Executive overview. 5 KPI cards (Today Electricity, Water, HVAC, Active Alerts, Efficiency Score). "
          "5 charts: 24h Line, 7-day Bar, Category Doughnut, Facility Bar, 30-day Area. "
          "Active Alerts table (top 5). AI Recommendations list (top 3). Data loaded via 4 parallel Axios calls."),
        ("/energy  Energy Monitoring","Real-time IoT telemetry control room. 4 live gauges: Power Factor (colour-coded), "
          "HVAC Load %, Solar Generation kWh, Temperature/Humidity. "
          "Searchable raw telemetry table (150 records). 'Ingest Sensor Metric' button opens POST form."),
        ("/analytics  Analytics","Deep intelligence. Carbon footprint card (Tons CO2e). "
          "24-hour peak demand heatmap grid. ASHRAE-style 0-100 efficiency rating. "
          "Full facility performance comparison matrix table."),
        ("/alerts  Alerts","AI incident management. Filter by Severity (Critical/High/Medium/Low) "
          "and Status (Open/In Progress/Resolved). Each card shows alert details + AI recommendation. "
          "Inline Acknowledge & Investigate / Mark Resolved buttons."),
        ("/recommendations  Recommendations","Prioritised AI action plan cards. "
          "Aggregate savings banner (total $/month + kWh/month). Each card: Priority, Category, "
          "Est. Cost Savings, Est. Energy Savings, Root Cause, Suggested Action, 'Implement' button."),
        ("/reports  Reports","Compliance export. One-click CSV / Excel (.xlsx) / PDF download. "
          "Configurable facility scope and report type selector (Full Log / Anomalies Only / Carbon Audit)."),
        ("/settings  Settings","Configure AI Agent rules (Spike %, HVAC %, Power Factor threshold). "
          "Dark/Light theme toggle. Platform roadmap panel showing upcoming modules."),
    ]
    for route, desc in pages:
        story.append(KeepTogether([
            sub(route),
            body(desc),
            sp(4),
        ]))

def s12_data(story):
    story.append(PageBreak())
    story.append(sec("12. Data Simulation & CSV Layer"))
    story.append(body(
        "Synthetic telemetry generated with <b>NumPy random seed 42</b> for reproducibility. "
        "The CSV layer is a swappable service — replacing CSV with live MQTT/WebSocket IoT streams "
        "requires changes only in data_service.py with zero frontend modifications."
    ))
    story.append(sp(6))
    story.append(tbl(
        ["Facility","Type","City","Base Load (kWh/hr)"],
        [
            ["CyberTech IT Park","IT Park","San Jose, CA","320"],
            ["St. Jude General Hospital","Hospital","Chicago, IL","480"],
            ["Pacific Innovation University","University","Seattle, WA","400"],
            ["Grand Horizon Shopping Mall","Shopping Mall","Dallas, TX","350"],
            ["Apex Precision Factory","Factory","Detroit, MI","550"],
        ],
        [5.5*cm, 4*cm, 4*cm, 3.5*cm]
    ))
    story.append(sp(6))
    story.append(hi(
        "Total: 5 facilities x 30 days x 24 hours = 3,600 records/facility = 18,000+ total hourly IoT records"
    ))
    story.append(sp(6))
    story.append(sub("Realistic Patterns Simulated"))
    for p in [
        "Diurnal business curve — higher load 08:00-19:00, lower at night.",
        "Weekend reductions — IT Parks and Factories run at 50% load on weekends.",
        "Solar generation — follows a sine curve from 07:00 to 18:00.",
        "3% deliberate anomaly injection — random spikes for AI Agent detection testing.",
        "HVAC overload events — 50% chance of HVAC spike when electricity anomaly fires.",
        "Low power factor events — 4% probability per record.",
    ]:
        story.append(bul(p))

def s13_reports(story):
    story.append(sp(10))
    story.append(sec("13. Report Export Engine"))
    story.append(tbl(
        ["Format","Library Used","Content"],
        [
            ["CSV",      "Python csv module",  "Full hourly IoT sensor telemetry stream (all 11 columns)"],
            ["Excel (.xlsx)","OpenPyXL >= 3.1","Formatted workbook with column headers, data rows, auto-sizing"],
            ["PDF",      "ReportLab >= 4.1","Formal audit document: cover, summary stats, compliance headers, sample telemetry"],
        ],
        [3*cm, 4*cm, 10*cm]
    ))

def s14_licenses(story):
    story.append(sp(10))
    story.append(sec("14. Licenses & Open Source"))
    story.append(hi(
        "All tools, frameworks, and libraries are 100% free and open-source (MIT / BSD / PostgreSQL licenses). "
        "No paid licenses, API keys, or cloud subscriptions are required. "
        "The platform can be used for personal, academic, and commercial purposes without any licensing fees."
    ))

def s15_run(story):
    story.append(PageBreak())
    story.append(sec("15. How to Run the Application"))
    story.append(sub("Prerequisites"))
    for p in ["Python 3.11+","Node.js 18+ and npm","Git (optional)"]:
        story.append(bul(p))
    story.append(sp(8))
    story.append(sub("Start Backend (FastAPI)"))
    story.append(sp(4))
    story.append(dark_code("cd backend\npython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"))
    story.append(sp(4))
    story.append(body("Backend auto-creates tables and seeds data.  Swagger UI: http://localhost:8000/docs"))
    story.append(sp(10))
    story.append(sub("Start Frontend (React + Vite)"))
    story.append(sp(4))
    story.append(dark_code("cd frontend\nnpm run dev"))
    story.append(sp(4))
    story.append(body("Dashboard available at: http://localhost:5173"))
    story.append(sp(8))
    story.append(sub("Key Environment Variables"))
    story.append(tbl(
        ["Variable","Default","Purpose"],
        [
            ["DATABASE_URL","sqlite:///./facilityops.db","Switch to PostgreSQL for production"],
            ["ELEVATED_SPIKE_PERCENT","20.0","Energy spike detection threshold (%)"],
            ["HVAC_ALERT_PERCENT","50.0","HVAC overload alert threshold (%)"],
            ["MIN_POWER_FACTOR","0.90","Power factor minimum before alert fires"],
            ["CORS_ORIGINS",'["http://localhost:5173"]',"Allowed frontend origins"],
        ],
        [5*cm, 5*cm, 7*cm]
    ))

def s16_roadmap(story):
    story.append(sp(10))
    story.append(sec("16. Future Roadmap"))
    story.append(tbl(
        ["Module","Description","Status"],
        [
            ["Energy Intelligence & Monitoring","Real-time IoT telemetry, AI anomaly detection, recommendations, export reports","ACTIVE"],
            ["Predictive Maintenance","ML-based equipment failure prediction (HVAC, lifts, pumps) using vibration + runtime data","Upcoming"],
            ["Occupancy & Space Optimization","People-count analytics, zone utilisation, desk/conference room efficiency scoring","Upcoming"],
            ["Security & Anomaly Intelligence","Access control monitoring, CCTV event classification, perimeter breach alerts","Upcoming"],
            ["Cost Intelligence & Billing","Tariff analysis, demand charge optimisation, ROI calculator, carbon credit tracking","Upcoming"],
        ],
        [5*cm, 9.5*cm, 2.5*cm]
    ))
    story.append(sp(12))
    story.append(HRFlowable(width="100%", thickness=1.5, color=CYAN, spaceAfter=8))
    story.append(body(
        "<b>End of Documentation</b>  —  Agentic AI For Smart Facility Operations And Optimizations v1.0  |  Energy Intelligence & Monitoring"
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
        title="Agentic AI For Smart Facility Operations And Optimizations Documentation",
        author="G Vinay Kumar",
        subject="Energy Intelligence & Monitoring — Technical Documentation",
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
