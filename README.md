# Agentic FacilityOps AI Platform

An enterprise-grade, multi-agent AI system for real-time facility management, predictive maintenance, occupancy optimization, utility cost reduction, and security anomaly detection.

## 🚀 Overview

The **Agentic FacilityOps AI Platform** integrates real-time IoT telemetry with specialized domain-specific AI agents:
- **Energy Agent**: Analyzes consumption patterns, peak usage, and anomalies.
- **Maintenance Agent**: Predicts HVAC degradation and equipment failures.
- **Occupancy Agent**: Optimizes HVAC/lighting based on real-time space utilization.
- **Security Agent**: Detects unauthorized access and perimeter anomalies.
- **Cost Agent**: Computes dynamic utility rates and peak-shaving recommendations.
- **Intelligence Engine**: Orchestrates all agents to deliver actionable facility insights.

---

## 📁 Project Structure

```
Agentic-FacilityOps-AI-Platform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py
│   │   ├── agents/
│   │   │   ├── energy_agent.py
│   │   │   ├── maintenance_agent.py
│   │   │   ├── occupancy_agent.py
│   │   │   ├── security_agent.py
│   │   │   ├── cost_agent.py
│   │   │   └── intelligence_engine.py
│   │   ├── services/
│   │   │   ├── data_service.py
│   │   │   ├── ml_service.py
│   │   │   └── alert_service.py
│   │   └── utils/
│   │       ├── helpers.py
│   │       ├── email_utils.py
│   │       └── logging_config.py
│   ├── ml_models/
│   │   ├── energy/
│   │   ├── maintenance/
│   │   ├── occupancy/
│   │   ├── security/
│   │   └── cost/
│   ├── data/
│   │   ├── raw/
│   │   └── processed/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   ├── charts/
│   │   │   ├── tables/
│   │   │   └── layout/
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── energy/
│   │   │   ├── maintenance/
│   │   │   ├── occupancy/
│   │   │   ├── security/
│   │   │   ├── reports/
│   │   │   └── alerts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── README.md
├── docker-compose.yml
└── .env.example
```

---

## 🛠️ Quick Start

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.venv\Scripts\activate
# Install dependencies:
pip install -r requirements.txt
# Run Uvicorn server:
python -m uvicorn app.main:app --reload --port 8000
```
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend App: [http://localhost:5173/](http://localhost:5173/)

### 3. Docker Orchestration
```bash
docker-compose up --build
```
