from pydantic import BaseModel
from typing import List, Optional

class TopicSchema(BaseModel):
    id: str
    name: str
    score: int
    difficulty: str = "Medium"
    lastTested: Optional[str] = None

class SubjectSchema(BaseModel):
    id: str
    name: str
    code: str
    icon: str = "📚"
    progress: int = 50
    topics: List[TopicSchema] = []

class WeakTopicDetectionRequest(BaseModel):
    threshold: float = 60.0

class WeakTopicResponse(BaseModel):
    subjectName: str
    subjectCode: str
    topicId: str
    topicName: str
    score: int
    difficulty: str
    severity: str
