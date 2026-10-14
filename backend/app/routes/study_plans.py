from fastapi import APIRouter
from typing import List
from app.schemas.study_plan_schemas import StudyPlanItem, StudyPlanGenerateRequest
from app.services.study_plan_service import study_plan_service

router = APIRouter(prefix="/study-plans", tags=["Personalized Study Plans"])

CURRENT_STUDY_PLAN = [
    {"day": 1, "title": "Normalization Basics & Functional Dependencies", "topic": "Normalization", "subject": "DBMS", "duration": "45 mins", "completed": True, "notes": "Cover 1NF and 2NF criteria with practical table breakdowns."},
    {"day": 2, "title": "3NF & BCNF Decomposition Techniques", "topic": "Normalization", "subject": "DBMS", "duration": "50 mins", "completed": True, "notes": "Focus on dependency preservation and lossless joins."},
    {"day": 3, "title": "Dynamic Programming: 1D Memoization", "topic": "Dynamic Programming", "subject": "DSA", "duration": "60 mins", "completed": False, "notes": "Solve Fibonacci, Climbing Stairs, and Coin Change."},
    {"day": 4, "title": "ACID Properties & Transaction Schedules", "topic": "Transactions", "subject": "DBMS", "duration": "45 mins", "completed": False, "notes": "Study Serializability, Conflict Serializability & Precedence graphs."},
    {"day": 5, "title": "Graph Traversal (BFS & DFS Masterclass)", "topic": "Graph Algorithms", "subject": "DSA", "duration": "50 mins", "completed": False, "notes": "Implement cycle detection in directed and undirected graphs."},
    {"day": 6, "title": "Weak-Topic Practice & Doubt Clearance", "topic": "Mixed Weak Topics", "subject": "All", "duration": "40 mins", "completed": False, "notes": "Consult AI Mentor on failed practice quiz questions."},
    {"day": 7, "title": "Full Adaptive Milestone Assessment", "topic": "Comprehensive Test", "subject": "DBMS + DSA", "duration": "60 mins", "completed": False, "notes": "Take 20-question AI milestone quiz to re-evaluate weak status."}
]

@router.get("/current", response_model=List[StudyPlanItem])
async def get_current_plan():
    return CURRENT_STUDY_PLAN

@router.post("/generate", response_model=List[StudyPlanItem])
async def generate_adaptive_plan(req: StudyPlanGenerateRequest):
    global CURRENT_STUDY_PLAN
    CURRENT_STUDY_PLAN = study_plan_service.generate_plan(req.weakTopics, req.targetGoal)
    return CURRENT_STUDY_PLAN
