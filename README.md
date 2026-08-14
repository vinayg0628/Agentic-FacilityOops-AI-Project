<div align="center">

# 🏢 Agentic FacilityOps AI Platform

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=00D9FF&center=true&vCenter=true&width=600&lines=Enterprise+AI+Facility+Management;Real-time+IoT+Sensor+Analytics;Predictive+Maintenance+Engine;Multi-Agent+AI+Architecture" alt="Typing SVG" />

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Dev-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)

[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-D71F00?style=flat-square)](https://www.sqlalchemy.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?style=flat-square)](https://axios-http.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

> **Enterprise-grade AI platform** for intelligent facility operations — combining real-time IoT sensor data, multi-agent AI, predictive analytics, and a stunning modern dashboard.

<br/>

[🚀 Quick Start](#-quick-start) &nbsp;•&nbsp; [✨ Features](#-features) &nbsp;•&nbsp; [🏛️ Architecture](#️-architecture) &nbsp;•&nbsp; [📡 API Reference](#-api-reference) &nbsp;•&nbsp; [🐳 Docker](#-docker-deployment) &nbsp;•&nbsp; [🗺️ Roadmap](#️-roadmap)

</div>

---

## 📋 Overview

The **Agentic FacilityOps AI Platform** is a full-stack, production-ready enterprise application that uses **multi-agent AI** to continuously monitor, analyze, and optimize facility operations across energy, maintenance, occupancy, security, and cost domains.

Built for **facility managers, engineers, and technicians** who need real-time visibility into their assets — from energy consumption spikes to equipment failure predictions.

### 🎯 What It Does

| Capability | Description |
|-----------|-------------|
| ⚡ **Energy Monitoring** | Real-time electricity, HVAC, and water consumption tracking with anomaly detection |
| 🔧 **Predictive Maintenance** | AI health scoring for 50+ assets, failure prediction with Remaining Useful Life (RUL) |
| 📊 **Analytics Dashboard** | Live KPIs, trend charts, and facility-wide performance metrics |
| 🔔 **Alert Management** | AI-generated alerts with severity classification and workflow management |
| 📋 **Maintenance Scheduling** | Auto-scheduled tasks with engineer assignments and priority queuing |
| 🔑 **Role-Based Access** | JWT authentication with 5 predefined roles |
| 🌐 **Global Search** | Real-time search across equipment, pages, and alerts |
| 🐳 **Docker Ready** | One-command deployment with PostgreSQL + Redis |

---

## ✨ Features

### 🤖 AI Agent Modules

| Module | Status | Capabilities |
|--------|--------|-------------|
| ⚡ **Energy Intelligence Agent** | ✅ **Live** | Spike detection, HVAC load analysis, power factor monitoring, night-hours anomaly detection, 7-day baseline comparison |
| 🔧 **Predictive Maintenance Agent** | ✅ **Live** | 11-rule diagnostic engine, health scoring formula, failure prediction, RUL calculation, type-specific recommendations |
| 🧠 **Intelligence Engine** | ✅ **Live** | Cross-agent orchestration, unified alert correlation |
| 👥 **Occupancy Agent** | 🔜 Coming | Space utilization, density tracking, zone occupancy |
| 🔐 **Security Agent** | 🔜 Coming | Access control, anomaly detection, incident management |
| 💰 **Cost Optimization Agent** | 🔜 Coming | Budget forecasting, cost attribution, savings recommendations |

### 🖥️ Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| 🏠 Main Dashboard | `/` | Enterprise KPIs, facility overview, live charts |
| ⚡ Energy Monitoring | `/energy` | Real-time energy consumption, sensor telemetry |
| 📊 Analytics | `/analytics` | Trend analysis, historical comparison |
| 🔔 Alerts | `/alerts` | Energy alert management and resolution |
| 💡 Recommendations | `/recommendations` | AI-generated optimization suggestions |
| 📄 Reports | `/reports` | Exportable PDF/Excel facility reports |
| ⚙️ Settings | `/settings` | Platform configuration |
| 🔧 **PM Dashboard** | `/maintenance` | Predictive maintenance KPIs and overview |
| 🏗️ Equipment | `/maintenance/equipment` | Asset inventory grid and table view |
| 💚 Health Scores | `/maintenance/health` | Animated SVG health gauges for all assets |
| 🔮 Predictions | `/maintenance/predictions` | Failure prediction table with RUL countdown |
| 📅 Schedule | `/maintenance/schedule` | Maintenance calendar with engineer assignments |
| 🚨 PM Alerts | `/maintenance/alerts` | AI-generated maintenance alerts with workflow |

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│               React 19 Frontend  (Vite 6 + Tailwind CSS)                 │
│                                                                          │
│  Dashboard │ Energy │ Maintenance │ Analytics │ Alerts │ Reports         │
│                                                                          │
│  ┌─────────────────────┐  ┌────────────────────────────────────────┐    │
│  │   FacilityContext   │  │  Axios API Client  (maintenanceApi.js) │    │
│  │  (Global State)     │  │  + Mock Fallbacks for Offline Dev      │    │
│  └─────────────────────┘  └────────────────────────────────────────┘    │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │  REST API  /api/*
┌───────────────────────────────▼──────────────────────────────────────────┐
│                    FastAPI Backend  (Python 3.11)                         │
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │  Energy Agent   │  │ Maintenance Agent │  │  Intelligence Engine  │  │
│  │  - Spike detect │  │  - 11 AI rules    │  │  (Cross-agent orch.)  │  │
│  │  - HVAC load    │  │  - Health score   │  └───────────────────────┘  │
│  │  - Baseline cmp │  │  - RUL prediction │                             │
│  └─────────────────┘  └──────────────────┘                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  JWT Auth  │  SQLAlchemy ORM  │  Pydantic v2  │  Redis Cache      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────────┬───────────────────┘
           │                                           │
    ┌──────▼──────────┐                    ┌───────────▼─────────┐
    │   PostgreSQL 16  │                    │      Redis 7        │
    │  (Production DB) │                    │  (Cache / PubSub)   │
    │   SQLite (Dev)   │                    └─────────────────────┘
    └─────────────────┘
```

### 📁 Project Structure

```
Agentic-FacilityOps-AI-Platform/
│
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── 📂 api/                    # REST API Endpoints (11 modules)
│   │   │   ├── auth.py                  ← JWT Register / Login / Refresh / Me
│   │   │   ├── energy.py                ← Energy sensor data
│   │   │   ├── analytics.py             ← Dashboard KPIs
│   │   │   ├── alerts.py                ← Energy alerts CRUD
│   │   │   ├── equipment.py             ← Equipment management (CRUD + health)
│   │   │   ├── maintenance.py           ← Maintenance APIs (10 endpoints)
│   │   │   ├── facilities.py            ← Facility master data
│   │   │   ├── recommendations.py       ← AI recommendations
│   │   │   └── reports.py               ← PDF / Excel export
│   │   │
│   │   ├── 📂 agents/                 # AI Agent Logic
│   │   │   ├── energy_agent.py          ← Energy analysis + spike detection
│   │   │   ├── maintenance_agent.py     ← 11-rule engine + health scoring
│   │   │   ├── intelligence_engine.py   ← Cross-agent orchestrator
│   │   │   ├── cost_agent.py
│   │   │   ├── occupancy_agent.py
│   │   │   └── security_agent.py
│   │   │
│   │   ├── 📂 core/
│   │   │   ├── config.py                ← Pydantic Settings (env vars)
│   │   │   ├── database.py              ← SQLAlchemy engine + session
│   │   │   └── security.py              ← JWT tokens + bcrypt hashing
│   │   │
│   │   ├── 📂 models/                 # SQLAlchemy ORM Models
│   │   │   ├── facility.py              ← Facility master
│   │   │   ├── energy.py                ← EnergyUsage readings
│   │   │   ├── alert.py                 ← EnergyAlert records
│   │   │   ├── equipment.py             ← Equipment + Monitoring + Alerts + Schedule
│   │   │   └── user.py                  ← User + RBAC roles
│   │   │
│   │   ├── 📂 services/               # Business Logic Layer
│   │   │   ├── analytics_service.py     ← Energy KPI computation
│   │   │   ├── maintenance_analytics_service.py  ← PM dashboard analytics
│   │   │   ├── maintenance_seed_service.py       ← 50 assets × 720 readings seeder
│   │   │   ├── data_service.py          ← CSV ingestion pipeline
│   │   │   ├── ml_service.py            ← ML model inference
│   │   │   ├── replay_service.py        ← Telemetry replay utility
│   │   │   └── alert_service.py         ← Alert generation logic
│   │   │
│   │   ├── 📂 schemas/                # Pydantic Response Schemas
│   │   └── 📂 utils/                  # Helper utilities
│   │
│   ├── 📂 tests/                      # pytest test suite
│   ├── 📂 data/                       # CSV datasets
│   ├── 📂 ml_models/                  # Trained model files
│   ├── Dockerfile                     # Multi-stage production build
│   └── requirements.txt               # 25+ Python dependencies
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📂 layout/             # Navbar (global search) + Sidebar
│   │   │   └── 📂 maintenance/        # 6 PM components
│   │   │       ├── MaintenanceKpiCard.jsx    ← Glassmorphism KPI cards
│   │   │       ├── HealthScoreGauge.jsx      ← Animated SVG circular gauge
│   │   │       ├── RiskBadge.jsx             ← Color-coded risk indicator
│   │   │       ├── EquipmentCard.jsx         ← Asset status card
│   │   │       ├── AlertRow.jsx              ← Alert table row
│   │   │       └── RecommendationCard.jsx    ← Expandable AI recommendation
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── DashboardPage.jsx      ← Main enterprise dashboard
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── MonitoringPage.jsx
│   │   │   ├── RecommendationsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── 📂 maintenance/        # 6 PM pages
│   │   │       ├── MaintenanceDashboard.jsx
│   │   │       ├── EquipmentPage.jsx
│   │   │       ├── HealthScoresPage.jsx
│   │   │       ├── PredictionsPage.jsx
│   │   │       ├── SchedulePage.jsx
│   │   │       └── AlertsManagementPage.jsx
│   │   │
│   │   ├── 📂 services/
│   │   │   ├── api.js                 ← Energy + Facility API client
│   │   │   └── maintenanceApi.js      ← PM APIs + mock fallbacks
│   │   │
│   │   └── 📂 context/
│   │       └── FacilityContext.jsx    ← Global state (facility, search, theme)
│   │
│   ├── Dockerfile                     # Node 20 → Nginx multi-stage
│   └── package.json
│
├── 📂 scripts/
│   ├── init_db.sql                    # PostgreSQL init (extensions + roles)
│   └── transform_kaggle_maintenance.py  # Kaggle dataset pipeline
│
├── generate_docs.py                   # Auto documentation generator
├── generate_pdm_dataset.py            # Predictive maintenance dataset generator
├── docker-compose.yml                 # Full stack: Backend + Frontend + DB + Redis
├── .env.example                       # 50+ environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Option A — Local Development (SQLite, recommended for dev)

**Prerequisites:** Python 3.11+, Node.js 20+

```bash
# 1. Clone the repository
git clone https://github.com/vinayg0628/Agentic-FacilityOops-AI-Project.git
cd Agentic-FacilityOops-AI-Project

# 2. Create environment file
cp .env.example .env

# 3. Setup & run Backend
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux / Mac
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Setup & run Frontend (open a new terminal)
cd frontend
npm install
npm run dev
```

**Open in browser:**

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 📚 Swagger Docs | http://localhost:8000/docs |
| 📖 ReDoc | http://localhost:8000/redoc |

> **Auto-seed:** On first startup, the backend automatically seeds **5 facilities**, **50 equipment assets**, and **36,000 sensor readings** into the database.

---

### Option B — Docker (Full Stack with PostgreSQL + Redis)

**Prerequisites:** Docker Desktop

```bash
# 1. Clone and configure
git clone https://github.com/vinayg0628/Agentic-FacilityOops-AI-Project.git
cd Agentic-FacilityOops-AI-Project

cp .env.example .env
# Edit .env — set your POSTGRES_PASSWORD, JWT_SECRET_KEY, REDIS_PASSWORD

# 2. Build and start all services
docker compose up --build

# 3. Stop
docker compose down

# 4. Full reset (removes volumes + data)
docker compose down -v
```

**Docker services start automatically:**

| Container | Image | Port |
|-----------|-------|------|
| `facilityops_backend` | Python 3.11-slim (multi-stage) | `8000` |
| `facilityops_frontend` | Node 20 → Nginx 1.27 | `5173` |
| `facilityops_postgres` | postgres:16-alpine | `5432` |
| `facilityops_redis` | redis:7-alpine | `6379` |

---

## 📡 API Reference

Interactive Swagger UI → **http://localhost:8000/docs**

### 🔑 Authentication

```http
POST   /api/auth/register     →  Register new user account
POST   /api/auth/login        →  Login → returns access_token + refresh_token
POST   /api/auth/refresh      →  Exchange refresh token for new access token
GET    /api/auth/me           →  Get current user profile (requires Bearer token)
POST   /api/auth/logout       →  Logout (discard token client-side)
```

### 🏢 Facilities

```http
GET    /api/facilities        →  List all facilities
GET    /api/facilities/{id}   →  Facility detail
```

### ⚡ Energy

```http
GET    /api/energy            →  Energy usage data (filterable by facility, date)
GET    /api/analytics         →  Dashboard KPIs (consumption, cost, HVAC %)
GET    /api/alerts            →  Energy alerts list
PATCH  /api/alerts/{id}       →  Update alert status
GET    /api/recommendations   →  AI energy optimization recommendations
GET    /api/reports           →  Generate facility report (PDF/Excel)
```

### 🔧 Predictive Maintenance

```http
GET    /api/equipment                         →  Equipment list (filter: facility, type, status)
GET    /api/equipment/{id}                    →  Equipment detail + real-time health score
POST   /api/equipment                         →  Add new equipment asset
PUT    /api/equipment/{id}                    →  Update equipment record
DELETE /api/equipment/{id}                    →  Remove equipment

GET    /api/maintenance                       →  Monitoring records
GET    /api/maintenance/analytics             →  Full PM dashboard KPIs
GET    /api/maintenance/health-score          →  Health scores for all equipment
GET    /api/maintenance/predictions           →  Failure predictions + RUL days
GET    /api/maintenance/schedule              →  Upcoming maintenance schedule
GET    /api/maintenance/alerts                →  Maintenance alerts
GET    /api/maintenance/recommendations       →  AI maintenance recommendations
POST   /api/maintenance                       →  Add sensor monitoring record
PATCH  /api/maintenance/alerts/{id}/status    →  Update alert status
PATCH  /api/maintenance/schedule/{id}/status  →  Update schedule task status
```

---

## 🧠 AI Agent Details

### ⚡ Energy Intelligence Agent

Monitors real-time energy telemetry and triggers alerts when:

| Rule | Condition | Severity |
|------|-----------|----------|
| Consumption Spike | Usage > 20% above 7-day baseline | 🟠 High |
| HVAC Overload | HVAC > 50% of total electricity | 🔴 Critical |
| Low Power Factor | PF < 0.90 | 🟡 Medium |
| Night Hour Anomaly | High load between 11PM–4AM | 🟡 Medium |

### 🔧 Predictive Maintenance Agent — Health Score Formula

```
Health Score (0–100) =
  Temperature Score  (0–25)  +  Vibration Score  (0–25)
  Runtime Score      (0–20)  +  Power Score       (0–15)
  Pressure Score     (0–10)  +  Operating Status  (0–5)
```

| Score Range | Category | Action |
|-------------|----------|--------|
| 90 – 100 | 🟢 **Excellent** | No action needed |
| 75 – 89 | 🔵 **Good** | Monitor regularly |
| 60 – 74 | 🟡 **Warning** | Schedule inspection |
| 40 – 59 | 🟠 **Critical** | Priority maintenance |
| 0 – 39 | 🔴 **Immediate Maintenance** | Emergency action |

### 🔍 11-Rule Diagnostic Engine

| # | Rule | Condition | Severity |
|---|------|-----------|----------|
| 1 | Motor Overheating | Temp > critical threshold | 🔴 Critical |
| 2 | High Temperature | Temp > warning threshold | 🟠 High |
| 3 | Severe Vibration | Vibration > critical threshold | 🔴 Critical |
| 4 | Elevated Vibration | Vibration > 80% of critical | 🟠 High |
| 5 | Excessive Runtime | Hours > max runtime | 🟠 High |
| 6 | Approaching Max Runtime | Hours > 85% of max | 🟡 Medium |
| 7 | Power Surge | Consumption > 125% baseline | 🟠 High |
| 8 | Power Elevated | Consumption > 115% baseline | 🟡 Medium |
| 9 | Abnormal Pressure | Pressure < 0.5 or > 8.0 bar | 🟠 High |
| 10 | High Humidity | Humidity > 85% | 🟡 Medium |
| 11 | Equipment Fault | Operating status = Fault | 🔴 Critical |

---

## 🔑 Authentication & Roles

JWT Bearer token authentication with Role-Based Access Control:

```bash
# Login
POST /api/auth/login
Body: { "username": "email@example.com", "password": "yourpassword" }

# Response
{
  "access_token": "eyJ...",     # Valid 60 minutes
  "refresh_token": "eyJ...",    # Valid 7 days
  "token_type": "bearer"
}

# Use in requests
Authorization: Bearer <access_token>
```

| Role | Access Level |
|------|-------------|
| `admin` | Full platform — all modules, all facilities |
| `facility_manager` | Manage all facilities, view all data |
| `engineer` | View + update maintenance records |
| `technician` | View assigned tasks only |
| `security_officer` | Security module access |

---

## 🗄️ Database

### Development — SQLite (default, zero config)
```env
DATABASE_URL=sqlite:///./facilityops.db
```

### Production — PostgreSQL
```env
DATABASE_URL=postgresql://facilityops_user:password@localhost:5432/facilityops_db
```

> Switch databases by changing just one environment variable. No code changes needed.

### Database Schema

| Table | Records (Seeded) | Description |
|-------|-----------------|-------------|
| `facilities` | 5 | IT Park, Hospital, Hotel, Mall, University |
| `energy_usage` | ~10,000+ | Hourly electricity, water, HVAC readings |
| `energy_alerts` | ~200+ | Energy anomaly alert records |
| `equipment` | **50** | 10 asset types × 5 facilities |
| `maintenance_monitoring` | **36,000** | 50 assets × 720 hourly readings (30 days) |
| `maintenance_alerts` | ~150 | AI-generated maintenance alert records |
| `maintenance_schedule` | ~125 | Planned maintenance tasks |
| `users` | — | Platform users with RBAC roles |

---

## 🌱 Seed Data

On first startup the backend auto-seeds realistic data:

```
5 Facilities:
  ├── FAC-001  CyberTech IT Park
  ├── FAC-002  City General Hospital
  ├── FAC-003  Grand Horizon Hotel
  ├── FAC-004  Metro Shopping Mall
  └── FAC-005  State University Campus

50 Equipment Assets (10 per facility):
  HVAC Unit × 2 │ Generator × 1 │ Water Pump × 1 │ Elevator × 1
  UPS × 1       │ Transformer × 1 │ Chiller × 1   │ Air Compressor × 1
  Lighting Panel × 1

36,000 Monitoring Records:
  50 assets × 720 hourly sensor readings (last 30 days)
  → Temperature, Vibration, Runtime, Pressure, Humidity, Power, Status
```

---

## 🧪 Testing

```bash
cd backend

# Run all tests
pytest tests/ -v

# With coverage report
pytest tests/ --cov=app --cov-report=html

# Open coverage report
open htmlcov/index.html   # Mac/Linux
start htmlcov/index.html  # Windows
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Application
ENVIRONMENT=development
SECRET_KEY=your-secret-key

# Database (pick one)
DATABASE_URL=sqlite:///./facilityops.db
# DATABASE_URL=postgresql://user:pass@localhost:5432/facilityops_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Frontend
VITE_API_URL=http://localhost:8000/api
```

> See [`.env.example`](.env.example) for the full list of 50+ variables.

---

## 🗺️ Roadmap

### ✅ Completed
- [x] **Milestone 1** — Energy Intelligence Agent + Dashboard
- [x] **Milestone 2** — Predictive Maintenance System (11-rule AI engine)
- [x] JWT Authentication with Role-Based Access Control
- [x] PostgreSQL + Redis Docker Compose deployment
- [x] Global search (pages + equipment real-time results)
- [x] Multi-facility enterprise view
- [x] Auto seed data (50 assets, 36,000 sensor records)
- [x] PDF/Excel report generation

### 🔜 Coming Next
- [ ] **Milestone 3** — Occupancy Management Module
- [ ] **Milestone 4** — Security & Access Control Module
- [ ] **Milestone 5** — Cost Optimization Agent
- [ ] ML-based failure prediction (XGBoost / LightGBM)
- [ ] WebSocket real-time live updates
- [ ] GitHub Actions CI/CD pipeline
- [ ] Kubernetes (K8s) deployment manifests
- [ ] Mobile App (React Native)
- [ ] Email/SMS alert notifications

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git add .
git commit -m "feat: describe your feature"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, deps update
- `docs:` — documentation changes

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌟 If this project helped you, please give it a star!

[![GitHub stars](https://img.shields.io/github/stars/vinayg0628/Agentic-FacilityOops-AI-Project?style=social)](https://github.com/vinayg0628/Agentic-FacilityOops-AI-Project/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/vinayg0628/Agentic-FacilityOops-AI-Project?style=social)](https://github.com/vinayg0628/Agentic-FacilityOops-AI-Project/network)

<br/>

**Built with ❤️ using FastAPI · React · PostgreSQL · Redis · Docker · SQLAlchemy · Tailwind CSS**

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-vinayg0628-181717?style=flat-square&logo=github)](https://github.com/vinayg0628/Agentic-FacilityOops-AI-Project)

</div>
