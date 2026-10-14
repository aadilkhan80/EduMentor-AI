import os
import secrets
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduMentor AI"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32), min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # PostgreSQL Database (pg8000 pure-python driver)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "edumentor_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"

    # Weak Area Detection
    WEAK_TOPIC_THRESHOLD: float = 60.0

    # LLM API
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
