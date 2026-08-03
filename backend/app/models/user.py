"""
User Model
==========
Stores platform users with role-based access control.

Roles:
    admin           – Full system access
    facility_manager – Manage all facilities
    engineer        – View and update maintenance records
    technician      – View assigned tasks only
    security_officer – Security module access
"""
import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    admin            = "admin"
    facility_manager = "facility_manager"
    engineer         = "engineer"
    technician       = "technician"
    security_officer = "security_officer"


class User(Base):
    __tablename__ = "users"

    user_id     = Column(Integer, primary_key=True, autoincrement=True, index=True)
    full_name   = Column(String(150), nullable=False)
    email       = Column(String(200), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    role        = Column(String(50), default=UserRole.engineer, nullable=False)
    is_active   = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    facility_id = Column(String(50), nullable=True)  # None = access to all facilities
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)
    last_login  = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User {self.email} [{self.role}]>"
