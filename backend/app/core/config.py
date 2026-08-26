import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic AI For Smart Facility Operations And Optimizations"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # ── Database ──────────────────────────────────────────
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./facilityops.db")

    # ── CORS ──────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    # ── JWT Authentication ─────────────────────────────────
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production-32chars")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Redis ─────────────────────────────────────────────
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "false").lower() == "true"

    # ── Energy Agent Thresholds ────────────────────────────
    ELEVATED_SPIKE_PERCENT: float = 20.0
    HVAC_ALERT_PERCENT: float = 50.0
    MIN_POWER_FACTOR: float = 0.90
    NIGHT_HOURS: list[int] = [23, 0, 1, 2, 3, 4]

    # ── Maintenance Agent Thresholds ───────────────────────
    MEDIUM_RUNTIME_PERCENT: float = 85.0
    CRITICAL_VIBRATION_MULTIPLIER: float = 1.0
    POWER_SURGE_PERCENT: float = 25.0
    POWER_ELEVATED_PERCENT: float = 15.0
    HUMIDITY_HIGH_THRESHOLD: float = 85.0

    # ── Replay / Live Demo ────────────────────────────────
    # Set REPLAY_MODE=true to stream CSV rows into the DB row-by-row on a timer.
    # REPLAY_INTERVAL_SECONDS controls how often a new row is inserted.
    # REPLAY_DURATION_MINUTES bounds the session; leave unset (None) for the
    # original indefinite-loop behaviour — this is NOT a breaking change.
    REPLAY_MODE: bool = False
    REPLAY_INTERVAL_SECONDS: int = 15
    REPLAY_DURATION_MINUTES: Optional[int] = None

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
