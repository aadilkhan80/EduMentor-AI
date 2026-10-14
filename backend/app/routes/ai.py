from datetime import datetime, timezone
import logging
import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from app.schemas.ai_schemas import AIChatRequest, AIChatResponse
from app.services.ai_service import ai_service
from app.database import db
from app.routes.auth import get_authenticated_user

router = APIRouter(prefix="/ai", tags=["AI Mentor"])
logger = logging.getLogger(__name__)
AI_HISTORY: Dict[str, List[Dict[str, Any]]] = {}


class AIExchange(BaseModel):
    question: str = Field(min_length=1, max_length=10000)
    answer: str = Field(min_length=1, max_length=50000)

@router.post("/ask", response_model=AIChatResponse)
async def ask_ai_mentor(req: AIChatRequest):
    answer = await ai_service.ask_mentor(req.question, req.history)
    return AIChatResponse(
        answer=answer,
        suggestedTopics=["Normalization", "Transactions", "Dynamic Programming", "Graph Traversal"]
    )


@router.get("/history")
async def get_ai_history(user: dict = Depends(get_authenticated_user)):
    if not db.get_connection():
        return AI_HISTORY.get(user["id"], [])
    try:
        return db.get_ai_history(user["id"])
    except Exception as error:
        logger.exception("Could not load AI chat history")
        raise HTTPException(status_code=500, detail="AI history could not be loaded.") from error


@router.post("/history", status_code=201)
async def save_ai_exchange(
    exchange: AIExchange,
    user: dict = Depends(get_authenticated_user),
):
    question = exchange.question.strip()
    answer = exchange.answer.strip()
    if not question or not answer:
        raise HTTPException(status_code=422, detail="Question and answer are required.")
    if not db.get_connection():
        created_at = datetime.now(timezone.utc).isoformat()
        history = AI_HISTORY.setdefault(user["id"], [])
        history.extend([
            {"id": f"chat_{uuid.uuid4().hex}", "role": "user", "content": question, "createdAt": created_at},
            {"id": f"chat_{uuid.uuid4().hex}", "role": "assistant", "content": answer, "createdAt": created_at},
        ])
        return {"saved": True}
    try:
        db.save_ai_exchange(user["id"], question, answer)
    except Exception as error:
        logger.exception("Could not save AI chat exchange")
        raise HTTPException(status_code=500, detail="AI response could not be saved to history.") from error
    return {"saved": True}


@router.delete("/history", status_code=204)
async def clear_ai_history(user: dict = Depends(get_authenticated_user)):
    if not db.get_connection():
        AI_HISTORY[user["id"]] = []
        return Response(status_code=204)
    try:
        db.clear_ai_history(user["id"])
    except Exception as error:
        logger.exception("Could not clear AI chat history")
        raise HTTPException(status_code=500, detail="AI history could not be cleared.") from error
    return Response(status_code=204)
