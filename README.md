# 🏢 Agentic FacilityOps AI Platform

<div align="center">

![Platform Banner](https://img.shields.io/badge/Agentic_FacilityOps-AI_Platform-blue?style=for-the-badge&logo=robot)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

**Enterprise AI-Powered Facility Management Platform**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

The **Agentic FacilityOps AI Platform** is a full-stack enterprise application that uses multi-agent AI to continuously monitor, analyze, and optimize facility operations. It combines real-time IoT sensor data with machine learning to deliver predictive insights across energy, maintenance, occupancy, security, and cost domains.

---

## ✨ Features

### 🤖 AI Agent Modules
| Module | Status | Description |
|--------|--------|-------------|
| ⚡ Energy Intelligence Agent | ✅ Live | Real-time energy monitoring, spike detection, HVAC analysis |
| 🔧 Predictive Maintenance Agent | ✅ Live | Equipment health scoring, failure prediction, 11-rule engine |
| 👥 Occupancy Agent | 🔜 Coming | Space utilization, density tracking |
| 🔐 Security Agent | 🔜 Coming | Access control, anomaly detection |
| 💰 Cost Optimization Agent | 🔜 Coming | Budget forecasting, cost attribution |

### 🏗️ Platform Features
- **Real-time Dashboard** — Live KPIs, animated charts, glassmorphism UI
- **Predictive Analytics** — Equipment failure prediction with RUL (Remaining Useful Life)
- **Alert Management** — AI-generated alerts with severity classification
- **Maintenance Scheduling** — Auto-scheduled maintenance with engineer assignments
- **JWT Authentication** — Role-based access (Admin, Manager, Engineer, Technician)
- **Global Search** — Real-time search across equipment, alerts, and pages
- **Multi-facility** — Enterprise view across 5 facility types
- **Docker Ready** — One-command deployment with PostgreSQL + Redis

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite + Tailwind)              │
│   Dashboard │ Energy │ Maintenance │ Alerts │ Reports            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API (Axios)
┌─────────────────────────▼───────────────────────────────────────┐
│                  FastAPI Backend (Python 3.11)                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Energy Agent │  │ Maintenance  │  │ Intelligence Engine   │  │
│  │              │  │ Agent        │  │ (Orchestrator)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SQLAlchemy ORM │ Pydantic │ JWT Auth │ Redis Cache        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────┬──────────────────────────────────────┬───────────────┘
           │                                      │
    ┌──────▼───────┐                    ┌─────────▼──────┐
    │  PostgreSQL  │                    │     Redis      │
    │  (Primary DB)│                    │  (Cache/PubSub)│
    └──────────────┘                    └────────────────┘
```

### Folder Structure

```
Agentic-FacilityOps-AI-Platform/
│
├── backend/
│   ├── app/
│   │   ├── api/            # REST API route handlers
│   │   │   ├── auth.py         ← JWT Login/Register
│   │   │   ├── energy.py
│   │   │   ├── equipment.py
│   │   │   ├── maintenance.py
│   │   │   └── ...
│   │   ├── agents/         # AI Agent logic
│   │   │   ├── energy_agent.py
│   │   │   ├── maintenance_agent.py
│   │   │   └── intelligence_engine.py
│   │   ├── core/
│   │   │   ├── config.py       ← Settings (env vars)
│   │   │   ├── database.py     ← SQLAlchemy engine
│   │   │   └── security.py     ← JWT + bcrypt
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── services/       # Business logic layer
│   │   ├── schemas/        # Pydantic response schemas
│   │   └── utils/          # Helper utilities
│   ├── tests/              # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         ← Navbar, Sidebar
│   │   │   └── maintenance/    ← KpiCard, Gauge, AlertRow...
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   └── maintenance/    ← 6 maintenance pages
│   │   ├── services/
│   │   │   ├── api.js          ← Energy API client
│   │   │   └── maintenanceApi.js
│   │   └── context/
│   │       └── FacilityContext.jsx
│   ├── Dockerfile
│   └── package.json
│
├── scripts/
│   └── init_db.sql         # PostgreSQL initialization
│
├── docker-compose.yml      # Full stack: Backend + Frontend + DB + Redis
├── .env.example            # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Option A — Local Development (SQLite)

**Prerequisites:** Python 3.11+, Node.js 20+

```bash
# 1. Clone
git clone https://github.com/vinayg0628/Agentic-FacilityOops-AI-Project.git
cd Agentic-FacilityOops-AI-Project

# 2. Setup environment
cp .env.example .env

# 3. Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

### Option B — Docker (Full Stack with PostgreSQL + Redis)

**Prerequisites:** Docker Desktop

```bash
# 1. Clone and configure
git clone https://github.com/vinayg0628/Agentic-FacilityOops-AI-Project.git
cd Agentic-FacilityOops-AI-Project
cp .env.example .env
# Edit .env with your passwords

# 2. Start everything
docker compose up --build

# 3. Stop
docker compose down

# 4. Stop and remove volumes (full reset)
docker compose down -v
```

---

## 📡 API Documentation

Interactive docs available at **http://localhost:8000/docs**

### Core Endpoints

#### Authentication
```
POST /api/auth/register     Register new user
POST /api/auth/login        Login → JWT tokens
POST /api/auth/refresh      Refresh access token
GET  /api/auth/me           Get current user profile
```

#### Facilities
```
GET  /api/facilities        List all facilities
GET  /api/facilities/{id}   Get facility details
```

#### Energy
```
GET  /api/energy            Energy usage data
GET  /api/analytics         Analytics & KPIs
GET  /api/alerts            Energy alerts
GET  /api/recommendations   AI recommendations
```

#### Predictive Maintenance
```
GET  /api/equipment                        Equipment list
GET  /api/equipment/{id}                   Equipment detail + health score
GET  /api/maintenance/analytics            Full PM dashboard KPIs
GET  /api/maintenance/health-score         Health scores for all equipment
GET  /api/maintenance/predictions          Failure predictions + RUL
GET  /api/maintenance/schedule             Maintenance schedule
GET  /api/maintenance/alerts               PM alerts
PATCH /api/maintenance/alerts/{id}/status  Update alert status
```

---

## 🔑 Authentication & Roles

The platform uses **JWT Bearer tokens** with role-based access control:

| Role | Permissions |
|------|-------------|
| `admin` | Full platform access |
| `facility_manager` | Manage all facilities and users |
| `engineer` | View + update maintenance records |
| `technician` | View assigned tasks only |
| `security_officer` | Security module access |

**Login flow:**
```
POST /api/auth/login
  → access_token (60 min)
  → refresh_token (7 days)

Include in requests:
  Authorization: Bearer <access_token>
```

---

## 🧠 AI Agent Design

### MaintenanceAgent — Health Scoring

```
Health Score = temp_score(25) + vibration_score(25) + runtime_score(20)
             + power_score(15) + pressure_score(10) + status_score(5)
             → clamped to [0, 100]
```

**Categories:**
- 🟢 90–100 Excellent
- 🔵 75–89  Good
- 🟡 60–74  Warning
- 🟠 40–59  Critical
- 🔴  0–39  Immediate Maintenance

### Rule Engine (11 Rules)
Temperature · Vibration · Runtime · Power Surge · Pressure · Humidity · Fault Status

---

## 🗄️ Database

### Development (SQLite)
```env
DATABASE_URL=sqlite:///./facilityops.db
```

### Production (PostgreSQL)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/facilityops_db
```

### Tables
| Table | Description |
|-------|-------------|
| `facilities` | Facility master data |
| `energy_usage` | Hourly sensor readings |
| `energy_alerts` | Energy anomaly alerts |
| `equipment` | Facility equipment assets |
| `maintenance_monitoring` | Equipment sensor time-series |
| `maintenance_alerts` | AI-generated maintenance alerts |
| `maintenance_schedule` | Planned maintenance tasks |
| `users` | Platform users with RBAC |

---

## 🐳 Docker Services

| Service | Image | Port |
|---------|-------|------|
| Backend | Python 3.11-slim (multi-stage) | 8000 |
| Frontend | Node 20 → Nginx 1.27 (multi-stage) | 5173 |
| PostgreSQL | postgres:16-alpine | 5432 |
| Redis | redis:7-alpine | 6379 |

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=app --cov-report=html
```

---

## 🗺️ Roadmap

- [x] Energy Intelligence Module
- [x] Predictive Maintenance Module
- [x] JWT Authentication
- [x] Docker + PostgreSQL + Redis setup
- [ ] Occupancy Management Module
- [ ] Security & Access Control Module
- [ ] Cost Optimization Module
- [ ] ML-based failure prediction (XGBoost)
- [ ] Mobile App (React Native)
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Kubernetes deployment

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file.

---

<div align="center">
Built with ❤️ using FastAPI · React · PostgreSQL · Redis · Docker
</div>
