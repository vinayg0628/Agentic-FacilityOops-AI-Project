from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.data_service import seed_database_from_csv
from app.services.maintenance_seed_service import seed_maintenance_data
from app.api import facilities, energy, analytics, alerts, recommendations, reports
from app.api import equipment as equipment_router, maintenance as maintenance_router
from app.api import auth as auth_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("facilityops")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Energy Intelligence & Monitoring API with AI Energy Agent & Predictive Maintenance System",
    version="1.0.0",
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
    logger.info("Initializing Database Tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        logger.info("Checking and seeding sample CSV facility telemetry dataset...")
        seed_database_from_csv(db)
        logger.info("Database initialization and CSV data seeding complete.")
        
        logger.info('Seeding maintenance equipment and monitoring data...')
        seed_maintenance_data(db)
        logger.info('Maintenance data seeding complete.')
    finally:
        db.close()

# Include Routers
app.include_router(facilities.router, prefix=settings.API_V1_STR)
app.include_router(energy.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(equipment_router.router, prefix=settings.API_V1_STR)
app.include_router(maintenance_router.router, prefix=settings.API_V1_STR)
app.include_router(auth_router.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "OK"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
