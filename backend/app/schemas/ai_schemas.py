from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AIChatRequest(BaseModel):
    question: str
    history: Optional[List[Dict[str, Any]]] = []

class AIChatResponse(BaseModel):
    answer: str
    suggestedTopics: Optional[List[str]] = []
