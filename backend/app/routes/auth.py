from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from ..database import get_db
from ..models.user import User
from ..config import settings
from ..dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def _create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def _user_dict(user: User) -> dict:
    return {"id": str(user.id), "email": user.email, "name": user.name}


@router.post("/register")
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    user = User(
        email=body.email,
        hashed_password=pwd_context.hash(body.password),
        name=body.name,
    )
    db.add(user)
    await db.flush()

    return {"data": {"token": _create_token(user.id), "user": _user_dict(user)}, "error": None}


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None


@router.patch("/me")
async def update_profile(
    body: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.name is not None:
        stripped = body.name.strip()
        if not stripped:
            raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
        current_user.name = stripped
    return {"data": _user_dict(current_user), "error": None}


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    return {"data": {"token": _create_token(user.id), "user": _user_dict(user)}, "error": None}
