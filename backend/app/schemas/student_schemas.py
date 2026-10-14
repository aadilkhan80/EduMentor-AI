from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any

class StudentProfile(BaseModel):
    id: str = "std_01"
    name: str = "Alex Johnson"
    email: str = "alex.johnson@university.edu"
    enrollmentNo: str = "EDU-2026-084"
    grade: str = "Computer Science & Engineering (Sem 4)"
    targetExam: str = "GATE & Semester Exams"
    dayStreak: int = 7
    studyMinutesToday: int = 42
    dailyGoalMinutes: int = 60
    overallScore: Optional[int] = 78

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    enrollmentNo: Optional[str] = None
    grade: Optional[str] = None
    targetExam: Optional[str] = None
    dailyGoalMinutes: Optional[int] = None
