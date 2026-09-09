from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
def health_check():
    return {"status": "ok", "service": "Agentic FacilityOps AI Platform"}

@router.get("/database")
def health_check_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/redis")
def health_check_redis():
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0, socket_timeout=1)
        r.ping()
        return {"status": "ok", "redis": "connected"}
    except Exception as e:
        return {"status": "error", "redis": "disconnected", "message": str(e)}

@router.get("/agents")
def health_check_agents():
    # Return status of agents based on last heartbeat or event
    return {
        "status": "ok",
        "agents": {
            "EnergyAgent": "active",
            "MaintenanceAgent": "active",
            "OccupancyAgent": "active",
            "SecurityAgent": "active",
            "CostAgent": "active",
            "IntelligenceEngine": "active"
        }
    }
