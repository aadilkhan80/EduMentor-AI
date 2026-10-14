from pydantic import BaseModel
from typing import List, Optional

class StudyPlanItem(BaseModel):
    day: int
    title: str
    topic: str
    subject: str
    duration: str = "45 mins"
    completed: bool = False
    notes: Optional[str] = None

class StudyPlanGenerateRequest(BaseModel):
    targetGoal: str = "College Semester Exams"
    dailyTime: str = "60 mins"
    weakTopics: List[dict] = []
