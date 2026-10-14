from fastapi import APIRouter, HTTPException
from app.schemas.student_schemas import StudentProfile, StudentUpdate

router = APIRouter(prefix="/students", tags=["Students"])

# In-memory student state (synchronized with database)
CURRENT_STUDENT = {
    "id": "std_01",
    "name": "Alex Johnson",
    "email": "alex.johnson@university.edu",
    "enrollmentNo": "EDU-2026-084",
    "grade": "Computer Science & Engineering (Sem 4)",
    "targetExam": "GATE & Semester Exams",
    "dayStreak": 7,
    "studyMinutesToday": 42,
    "dailyGoalMinutes": 60,
    "overallScore": 78
}

@router.get("/me", response_model=StudentProfile)
async def get_current_student():
    return CURRENT_STUDENT

@router.put("/me", response_model=StudentProfile)
async def update_current_student(data: StudentUpdate):
    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            CURRENT_STUDENT[key] = value
    return CURRENT_STUDENT
