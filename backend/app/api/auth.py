"""
Authentication API
==================
Endpoints:
    POST /api/auth/register  – Register a new user
    POST /api/auth/login     – Login and receive JWT tokens
    POST /api/auth/refresh   – Refresh access token
    GET  /api/auth/me        – Get current user profile
    POST /api/auth/logout    – Logout (client-side token discard)
"""
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user_email,
)
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Pydantic Schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.engineer
    facility_id: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UserProfile(BaseModel):
    user_id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    facility_id: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserProfile, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new platform user.
    Email must be unique. Password is bcrypt-hashed before storage.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role,
        facility_id=payload.facility_id,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login with email + password.
    Returns a short-lived access token and a longer-lived refresh token.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated.")

    # Update last login
    user.last_login = datetime.datetime.utcnow()
    db.commit()

    token_data = {"sub": user.email, "role": user.role, "user_id": user.user_id}
    return {
        "access_token":  create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type":    "bearer",
        "user": {
            "user_id":     user.user_id,
            "full_name":   user.full_name,
            "email":       user.email,
            "role":        user.role,
            "facility_id": user.facility_id,
        },
    }


@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """
    Exchange a valid refresh token for a new access token.
    """
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Invalid token type — expected refresh token.")
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive.")
    token_data = {"sub": user.email, "role": user.role, "user_id": user.user_id}
    return {
        "access_token": create_access_token(token_data),
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserProfile)
def get_me(email: str = Depends(get_current_user_email), db: Session = Depends(get_db)):
    """
    Return the authenticated user's profile.
    Requires a valid Bearer token in Authorization header.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.post("/logout")
def logout():
    """
    Logout is handled client-side by discarding the token.
    In production, integrate with a token blacklist (Redis).
    """
    return {"message": "Logged out successfully. Please discard your token."}
