import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic FacilityOps AI Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./facilityops.db")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    
    # Energy Agent Threshold Parameters
    ELEVATED_SPIKE_PERCENT: float = 20.0  # % above 7-day baseline
    HVAC_ALERT_PERCENT: float = 50.0       # HVAC > 50% total electricity
    MIN_POWER_FACTOR: float = 0.90         # Penalty threshold if PF < 0.90
    NIGHT_HOURS: list[int] = [23, 0, 1, 2, 3, 4] # Off-peak night hours

    class Config:
        case_sensitive = True

settings = Settings()
