import os
import httpx
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class AIService:
    @staticmethod
    async def ask_mentor(question: str, history: Optional[List[Dict[str, Any]]] = None) -> str:
        # Check if Gemini API Key is configured
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
                prompt = (
                    "You are EduMentor AI, a world-class academic mentor. Explain concepts clearly, "
                    "provide practical real-world examples, highlight common exam pitfalls, and give practice questions.\n\n"
                    f"Student Question: {question}"
                )
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            return candidates[0]["content"]["parts"][0]["text"]
            except Exception as e:
                logger.warning(f"Error calling Gemini API: {e}. Falling back to internal engine.")

        # Fallback intelligent academic knowledge engine
        q = question.lower()
        if "normalization" in q or "dbms" in q:
            return (
                "### 🗄️ Database Normalization Explained\n\n"
                "**Normalization** is the systematic method of organizing relational tables to minimize data redundancy "
                "and prevent insertion, update, and deletion anomalies.\n\n"
                "#### 1. First Normal Form (1NF)\n"
                "- Each table column must contain atomic (indivisible) values.\n"
                "- No repeating attributes or multivalued arrays.\n\n"
                "#### 2. Second Normal Form (2NF)\n"
                "- Satisfies 1NF.\n"
                "- No **partial functional dependency**: every non-prime attribute must depend on the whole candidate key.\n\n"
                "#### 3. Third Normal Form (3NF)\n"
                "- Satisfies 2NF.\n"
                "- No **transitive dependency**: non-prime attributes must not depend on other non-prime attributes.\n\n"
                "#### 4. Boyce-Codd Normal Form (BCNF)\n"
                "- Stricter 3NF: For every functional dependency $X \\rightarrow Y$, $X$ must be a **Super Key**.\n\n"
                "💡 *Exam Tip: Always check if the primary key is composite before testing for 2NF violations!*"
            )

        if "transaction" in q or "acid" in q:
            return (
                "### ⚡ ACID Properties in DBMS\n\n"
                "Transactions ensure data integrity in concurrent database systems:\n\n"
                "1. **Atomicity**: 'All-or-Nothing' execution. If a transaction crashes, prior operations rollback.\n"
                "2. **Consistency**: Database invariants and integrity constraints remain preserved.\n"
                "3. **Isolation**: Concurrent transactions execute as if they were running serially.\n"
                "4. **Durability**: Once committed, changes persist across power losses and system crashes.\n\n"
                "💡 *Precedence Graph Rule: A schedule is conflict-serializable if and only if its precedence graph contains no directed cycles.*"
            )

        if "dynamic programming" in q or "dp" in q:
            return (
                "### 🧠 Dynamic Programming (DP) Architecture\n\n"
                "Dynamic Programming solves optimization problems by caching solutions to overlapping subproblems.\n\n"
                "#### Core Components:\n"
                "1. **Optimal Substructure**: An optimal solution can be constructed from optimal solutions to subproblems.\n"
                "2. **Overlapping Subproblems**: Subproblems are solved repeatedly rather than generating new ones.\n"
                "3. **Memoization vs Tabulation**: Top-down recursion with cache vs bottom-up iterative table filling."
            )

        return (
            f"### 🎓 EduMentor AI Insight on: {question}\n\n"
            "1. **Conceptual Framework**: Connecting theoretical concepts to structured practice builds deep understanding.\n"
            "2. **Recommended Action**: Break this topic into small definitions, review edge cases, and test yourself with an adaptive quiz."
        )

ai_service = AIService()
