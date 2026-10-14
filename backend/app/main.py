from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import db
from app.routes import auth, students, subjects, study_plans, quizzes, ai, search_history

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Learn Smarter. Improve Faster. AI-Powered Personalized Learning Platform for College Ideathons.",
    version="1.0.0"
)

# CORS configuration for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(subjects.router, prefix="/api")
app.include_router(study_plans.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(search_history.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    # Attempt to initialize PostgreSQL schema via pg8000
    try:
        if db.initialize_schema():
            auth.initialize_auth()
            subjects.initialize_subjects()
            quizzes.initialize_quiz_history()
    except Exception as e:
        print(f"PostgreSQL initialization note: {e}")

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": "Learn Smarter. Improve Faster.",
        "status": "healthy",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "database_connected": db.is_connected,
        "environment": settings.ENVIRONMENT
    }
