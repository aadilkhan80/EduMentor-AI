from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas.quiz_schemas import QuizQuestionSchema, QuizGenerateRequest, QuizResultSubmission
from app.services.quiz_service import quiz_service
from app.database import db
from app.routes.auth import get_authenticated_user
from fastapi import Depends, HTTPException
from datetime import date
import uuid

router = APIRouter(prefix="/quizzes", tags=["AI Quizzes"])

QUIZ_HISTORY = [
    {"id": "q_101", "subject": "DBMS", "topic": "Normalization", "score": 40, "total": 100, "date": "2026-09-28", "status": "Needs Review", "questionsCount": 4},
    {"id": "q_102", "subject": "DSA", "topic": "Dynamic Programming", "score": 45, "total": 100, "date": "2026-09-27", "status": "Needs Review", "questionsCount": 4},
    {"id": "q_103", "subject": "Python", "topic": "OOP & Classes", "score": 88, "total": 100, "date": "2026-09-25", "status": "Mastered", "questionsCount": 4},
    {"id": "q_104", "subject": "DBMS", "topic": "SQL Queries & Joins", "score": 82, "total": 100, "date": "2026-09-24", "status": "Mastered", "questionsCount": 4},
]
QUIZ_HISTORY_BY_STUDENT = {"std_01": QUIZ_HISTORY}

@router.get("/history")
async def get_quiz_history(user: dict = Depends(get_authenticated_user)):
    stored_history = db.get_quiz_history(user["id"])
    if stored_history is not None:
        return stored_history
    return QUIZ_HISTORY_BY_STUDENT.get(user["id"], [])

def initialize_quiz_history(student_id: str = "std_01"):
    stored_history = db.get_quiz_history(student_id)
    if stored_history == []:
        for item in reversed(QUIZ_HISTORY):
            correct_count = round(item["score"] * item["questionsCount"] / 100)
            db.save_quiz_result({
                "subject": item["subject"],
                "topic": item["topic"],
                "score": item["score"],
                "correctCount": correct_count,
                "incorrectCount": item["questionsCount"] - correct_count,
                "questionsCount": item["questionsCount"],
                "studentId": student_id,
            })

@router.post("/generate", response_model=List[QuizQuestionSchema])
async def generate_quiz(req: QuizGenerateRequest):
    return quiz_service.generate_quiz(req.subject, req.topic, req.difficulty, req.count)

@router.post("/results")
async def submit_quiz_result(
    result: QuizResultSubmission,
    user: dict = Depends(get_authenticated_user),
):
    result_data = result.model_dump()
    result_data["studentId"] = user["id"]
    try:
        stored_entry = db.save_quiz_result(result_data)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Quiz result could not be saved.") from error
    if stored_entry is not None:
        return {"message": "Quiz result recorded successfully", "entry": stored_entry}

    entry = {
        "id": f"q_{uuid.uuid4().hex}",
        "subject": result.subject,
        "topic": result.topic,
        "score": result.score,
        "total": 100,
        "date": date.today().isoformat(),
        "status": "Mastered" if result.score >= 60 else "Needs Review",
        "questionsCount": result.questionsCount
    }
    history = QUIZ_HISTORY_BY_STUDENT.setdefault(user["id"], [])
    history.insert(0, entry)
    return {"message": "Quiz result recorded successfully", "entry": entry}
