from fastapi import APIRouter
from app.api import facilities, energy, analytics, alerts, recommendations, reports

api_router = APIRouter()

api_router.include_router(facilities.router, tags=["facilities"])
api_router.include_router(energy.router, tags=["energy"])
api_router.include_router(analytics.router, tags=["analytics"])
api_router.include_router(alerts.router, tags=["alerts"])
api_router.include_router(recommendations.router, tags=["recommendations"])
api_router.include_router(reports.router, tags=["reports"])
