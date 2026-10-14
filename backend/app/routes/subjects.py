from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.subject_schemas import SubjectSchema, WeakTopicDetectionRequest, WeakTopicResponse
from app.services.analytics_service import analytics_service
from app.database import db
import logging

router = APIRouter(prefix="/subjects", tags=["Subjects & Performance"])
logger = logging.getLogger(__name__)

SUBJECTS_DB = [
    {
        "id": "sub_1",
        "name": "Database Management (DBMS)",
        "code": "CS301",
        "icon": "🗄️",
        "progress": 65,
        "topics": [
            {"id": "top_1", "name": "SQL & Relational Algebra", "score": 82, "difficulty": "Medium", "lastTested": "2026-09-25"},
            {"id": "top_2", "name": "ER Modeling & Relational Design", "score": 76, "difficulty": "Easy", "lastTested": "2026-09-24"},
            {"id": "top_3", "name": "Normalization (1NF, 2NF, 3NF, BCNF)", "score": 42, "difficulty": "Hard", "lastTested": "2026-09-28"},
            {"id": "top_4", "name": "Transactions & Concurrency Control", "score": 48, "difficulty": "Hard", "lastTested": "2026-09-27"},
            {"id": "top_5", "name": "Indexing & B-Trees", "score": 70, "difficulty": "Medium", "lastTested": "2026-09-20"},
        ]
    },
    {
        "id": "sub_2",
        "name": "Data Structures & Algorithms (DSA)",
        "code": "CS302",
        "icon": "💻",
        "progress": 58,
        "topics": [
            {"id": "top_6", "name": "Arrays & Two Pointers", "score": 85, "difficulty": "Easy", "lastTested": "2026-09-26"},
            {"id": "top_7", "name": "Trees & Binary Search Trees", "score": 68, "difficulty": "Medium", "lastTested": "2026-09-23"},
            {"id": "top_8", "name": "Dynamic Programming & Memoization", "score": 38, "difficulty": "Hard", "lastTested": "2026-09-29"},
            {"id": "top_9", "name": "Graph Algorithms (BFS/DFS, Dijkstra)", "score": 50, "difficulty": "Hard", "lastTested": "2026-09-25"},
        ]
    },
    {
        "id": "sub_3",
        "name": "Python Programming",
        "code": "CS204",
        "icon": "🐍",
        "progress": 82,
        "topics": [
            {"id": "top_10", "name": "Data Types & Control Flow", "score": 92, "difficulty": "Easy", "lastTested": "2026-09-21"},
            {"id": "top_11", "name": "OOP & Classes", "score": 84, "difficulty": "Medium", "lastTested": "2026-09-22"},
            {"id": "top_12", "name": "Decorators & Generators", "score": 70, "difficulty": "Hard", "lastTested": "2026-09-24"},
        ]
    },
    {
        "id": "sub_4",
        "name": "Discrete Mathematics",
        "code": "MA201",
        "icon": "📐",
        "progress": 74,
        "topics": [
            {"id": "top_13", "name": "Propositional Logic", "score": 88, "difficulty": "Easy", "lastTested": "2026-09-18"},
            {"id": "top_14", "name": "Combinatorics & Probability", "score": 72, "difficulty": "Medium", "lastTested": "2026-09-19"},
            {"id": "top_15", "name": "Recurrence Relations", "score": 55, "difficulty": "Hard", "lastTested": "2026-09-23"},
        ]
    }
]

def initialize_subjects():
    stored_subjects = db.get_subjects()
    if stored_subjects == []:
        for subject in SUBJECTS_DB:
            db.save_subject(subject)

@router.get("", response_model=List[SubjectSchema])
async def get_all_subjects():
    stored_subjects = db.get_subjects()
    return stored_subjects if stored_subjects is not None else SUBJECTS_DB

@router.post("", response_model=SubjectSchema, status_code=201)
async def create_subject(subject: SubjectSchema):
    subjects = await get_all_subjects()
    if any(item["id"] == subject.id for item in subjects):
        raise HTTPException(status_code=409, detail="Subject ID already exists")
    if any(item["code"].lower() == subject.code.lower() for item in subjects):
        raise HTTPException(status_code=409, detail="A subject with this code already exists")
    if any(item["name"].lower() == subject.name.lower() for item in subjects):
        raise HTTPException(status_code=409, detail="A subject with this name already exists")
    subject_data = subject.model_dump()
    if db.get_connection():
        try:
            db.save_subject(subject_data)
        except Exception as error:
            logger.exception("Failed to save subject %s", subject.id)
            raise HTTPException(status_code=500, detail="Subject could not be saved to the database.") from error
    else:
        SUBJECTS_DB.append(subject_data)
    return subject_data

@router.put("/{subject_id}", response_model=SubjectSchema)
async def update_subject(subject_id: str, subject: SubjectSchema):
    if subject.id != subject_id:
        raise HTTPException(status_code=400, detail="Subject ID cannot be changed")
    subjects = await get_all_subjects()
    index = next((i for i, item in enumerate(subjects) if item["id"] == subject_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    if any(
        item["id"] != subject_id and item["code"].lower() == subject.code.lower()
        for item in subjects
    ):
        raise HTTPException(status_code=409, detail="A subject with this code already exists")
    if any(
        item["id"] != subject_id and item["name"].lower() == subject.name.lower()
        for item in subjects
    ):
        raise HTTPException(status_code=409, detail="A subject with this name already exists")
    subject_data = subject.model_dump()
    if db.get_connection():
        try:
            db.save_subject(subject_data)
        except Exception as error:
            logger.exception("Failed to update subject %s", subject.id)
            raise HTTPException(status_code=500, detail="Subject could not be saved to the database.") from error
    else:
        SUBJECTS_DB[index] = subject_data
    return subject_data

@router.delete("/{subject_id}", status_code=204)
async def remove_subject(subject_id: str):
    subjects = await get_all_subjects()
    if not any(item["id"] == subject_id for item in subjects):
        raise HTTPException(status_code=404, detail="Subject not found")

    if db.get_connection():
        if not db.delete_subject(subject_id):
            raise HTTPException(status_code=404, detail="Subject not found")
    else:
        SUBJECTS_DB[:] = [item for item in SUBJECTS_DB if item["id"] != subject_id]

@router.post("/weak-topics", response_model=List[WeakTopicResponse])
async def detect_weak_topics(req: WeakTopicDetectionRequest):
    return analytics_service.identify_weak_topics(await get_all_subjects(), req.threshold)
