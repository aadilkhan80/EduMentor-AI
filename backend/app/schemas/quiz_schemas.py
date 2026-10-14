from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QuizQuestionSchema(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str

class QuizGenerateRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str = "Medium"
    count: int = 4

class QuizResultSubmission(BaseModel):
    subject: str
    topic: str
    difficulty: str
    score: int
    correctCount: int
    incorrectCount: int
    questionsCount: int
    answers: Optional[Dict[str, int]] = None
