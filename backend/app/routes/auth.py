from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import uuid
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

from app.config import settings
from app.database import db

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


DEMO_PASSWORD_HASH = hashlib.sha256("password123".encode()).hexdigest()
USERS_DB = {
    "alex.johnson@university.edu": {
        "id": "std_01",
        "name": "Alex Johnson",
        "email": "alex.johnson@university.edu",
        "hashed_password": DEMO_PASSWORD_HASH,
        "role": "student",
    }
}


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


def create_token(user: dict) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user["id"], "email": user["email"], "exp": expires_at},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def verify_password(password: str, password_hash: str) -> bool:
    if password_hash.startswith(("$2a$", "$2b$", "$2y$")):
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    return hmac.compare_digest(
        hashlib.sha256(password.encode()).hexdigest(),
        password_hash,
    )


def initialize_auth():
    if db.get_connection() and not db.get_user_by_email("alex.johnson@university.edu"):
        db.create_account(USERS_DB["alex.johnson@university.edu"])


async def get_authenticated_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Sign in to access this history.")
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except jwt.InvalidTokenError as error:
        raise HTTPException(status_code=401, detail="Session expired. Please sign in again.") from error

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid account session.")
    return {"id": user_id}


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(req: RegisterRequest):
    if len(req.password.encode()) > 72:
        raise HTTPException(status_code=422, detail="Password must be at most 72 bytes.")
    email = str(req.email).lower()
    if db.get_connection():
        if db.get_user_by_email(email):
            raise HTTPException(status_code=409, detail="Email already registered")
    elif email in USERS_DB:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = {
        "id": f"std_{uuid.uuid4().hex}",
        "name": req.name.strip(),
        "email": email,
        "hashed_password": bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode(),
        "role": "student",
    }
    if not user["name"]:
        raise HTTPException(status_code=422, detail="Name cannot be empty")

    if db.get_connection():
        try:
            db.create_account(user)
        except Exception as error:
            raise HTTPException(status_code=409, detail="Account could not be created. This email may already be registered.") from error
    else:
        USERS_DB[email] = user

    return TokenResponse(access_token=create_token(user), user=public_user(user))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    email = str(req.email).lower()
    user = db.get_user_by_email(email) if db.get_connection() else None
    user = user or USERS_DB.get(email)
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(access_token=create_token(user), user=public_user(user))
