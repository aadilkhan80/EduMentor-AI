import logging
import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from app.database import db
from app.routes.auth import get_authenticated_user

router = APIRouter(prefix="/history", tags=["Search History"])
logger = logging.getLogger(__name__)
SEARCH_HISTORY: Dict[str, List[Dict[str, Any]]] = {}


class SearchQuery(BaseModel):
    query: str = Field(min_length=1, max_length=500)


@router.get("/search")
async def get_search_history(user: dict = Depends(get_authenticated_user)):
    if not db.get_connection():
        return SEARCH_HISTORY.get(user["id"], [])
    try:
        return db.get_search_history(user["id"])
    except Exception as error:
        logger.exception("Could not load search history")
        raise HTTPException(status_code=500, detail="Search history could not be loaded.") from error


@router.post("/search", status_code=201)
async def add_search_query(
    item: SearchQuery,
    user: dict = Depends(get_authenticated_user),
):
    query = item.query.strip()
    if not query:
        raise HTTPException(status_code=422, detail="Search query cannot be empty.")
    if not db.get_connection():
        entry = {"id": f"search_{uuid.uuid4().hex}", "query": query}
        history = SEARCH_HISTORY.setdefault(user["id"], [])
        history.insert(0, entry)
        del history[50:]
        return entry
    try:
        return db.save_search_query(user["id"], query)
    except Exception as error:
        logger.exception("Could not save search query")
        raise HTTPException(status_code=500, detail="Search query could not be saved.") from error


@router.delete("/search/{entry_id}", status_code=204)
async def delete_search_query(
    entry_id: str,
    user: dict = Depends(get_authenticated_user),
):
    if not db.get_connection():
        SEARCH_HISTORY[user["id"]] = [
            item for item in SEARCH_HISTORY.get(user["id"], [])
            if item["id"] != entry_id
        ]
        return Response(status_code=204)
    try:
        if not db.delete_search_entry(user["id"], entry_id):
            raise HTTPException(status_code=404, detail="Search entry was not found.")
    except HTTPException:
        raise
    except Exception as error:
        logger.exception("Could not delete search history entry")
        raise HTTPException(status_code=500, detail="Search history entry could not be removed.") from error
    return Response(status_code=204)


@router.delete("/search", status_code=204)
async def clear_search_history(user: dict = Depends(get_authenticated_user)):
    if not db.get_connection():
        SEARCH_HISTORY[user["id"]] = []
        return Response(status_code=204)
    try:
        db.clear_search_history(user["id"])
    except Exception as error:
        logger.exception("Could not clear search history")
        raise HTTPException(status_code=500, detail="Search history could not be cleared.") from error
    return Response(status_code=204)
