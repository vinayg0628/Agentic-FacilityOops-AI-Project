from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.data_service import seed_database_from_csv
from app.services.maintenance_seed_service import seed_maintenance_data
from app.services.seed_occupancy_security import seed_occupancy_security_data
from app.api import facilities, energy, analytics, alerts, recommendations, reports
from app.api import equipment as equipment_router, maintenance as maintenance_router
from app.api import auth as auth_router
from app.api.routes import api_router as custom_api_router
from app.api.occupancy_routes import router as occupancy_router
from app.api.security_routes import router as security_router
from app.api.incident_routes import router as incident_router
from app.api.intelligence_routes import router as intelligence_router

# Import new models so Base.metadata knows about them
import app.models.occupancy_models  # noqa: F401
import app.models.security_models   # noqa: F401

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("facilityops")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Agentic AI For Smart Facility Operations And Optimizations — Energy, Maintenance, Occupancy & Security Intelligence",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup lifecycle hook
@app.on_event("startup")
def startup_event():
    logger.info("Initializing Database Tables (Milestone 1-3)...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        logger.info("Seeding energy/facility data...")
        seed_database_from_csv(db)
        logger.info("Energy/facility seeding complete.")

        logger.info("Seeding maintenance data...")
        seed_maintenance_data(db)
        logger.info("Maintenance seeding complete.")

        logger.info("Seeding occupancy & security data...")
        seed_occupancy_security_data(db)
        logger.info("Occupancy & security seeding complete.")
    finally:
        db.close()

    if settings.REPLAY_MODE:
        from app.services.replay_service import start_replay
        start_replay()
        logger.info(
            "Live replay started | interval=%ss | duration=%s",
            settings.REPLAY_INTERVAL_SECONDS,
            f"{settings.REPLAY_DURATION_MINUTES} min"
            if settings.REPLAY_DURATION_MINUTES is not None
            else "indefinite",
        )

# ── Milestone 1 & 2 Routers ──────────────────────────────────────────────────
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(energy.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(equipment_router.router, prefix=settings.API_V1_STR)
app.include_router(maintenance_router.router, prefix=settings.API_V1_STR)
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(custom_api_router, prefix=settings.API_V1_STR)

# ── Milestone 3 Routers ───────────────────────────────────────────────────────
app.include_router(occupancy_router, prefix=settings.API_V1_STR)
app.include_router(security_router, prefix=settings.API_V1_STR)
app.include_router(incident_router, prefix=settings.API_V1_STR)
app.include_router(intelligence_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "3.0.0",
        "milestones": ["Energy Intelligence", "Predictive Maintenance", "Occupancy & Security"],
        "docs": "/docs",
        "health": "OK"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
