import pg8000.native
import logging
import uuid
from datetime import date
from typing import Optional, List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

# Complete PostgreSQL Schema Initialization Script (14 Relational Tables)
SCHEMA_SQL = """
-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    enrollment_no VARCHAR(100) UNIQUE,
    grade_or_semester VARCHAR(100),
    target_exam_or_goal VARCHAR(255),
    preferences JSONB DEFAULT '{}'::jsonb,
    day_streak INT DEFAULT 7,
    study_minutes_today INT DEFAULT 42,
    daily_goal_minutes INT DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50) NOT NULL,
    icon VARCHAR(20) DEFAULT '📚',
    description TEXT,
    progress INT DEFAULT 0
);

-- 4. Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    order_index INT DEFAULT 1,
    score INT DEFAULT 50,
    last_tested DATE DEFAULT CURRENT_DATE
);

-- 5. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    total_marks DECIMAL DEFAULT 100.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Student Performance Table
CREATE TABLE IF NOT EXISTS student_performance (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE CASCADE,
    marks_obtained DECIMAL NOT NULL,
    total_marks DECIMAL DEFAULT 100.0,
    percentage DECIMAL NOT NULL,
    assessment_type VARCHAR(50) DEFAULT 'quiz',
    assessment_date DATE DEFAULT CURRENT_DATE
);

-- 7. Study Plans Table
CREATE TABLE IF NOT EXISTS study_plans (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    goal VARCHAR(255),
    total_days INT DEFAULT 7,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Study Plan Items Table
CREATE TABLE IF NOT EXISTS study_plan_items (
    id VARCHAR(64) PRIMARY KEY,
    study_plan_id VARCHAR(64) REFERENCES study_plans(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    activity_title VARCHAR(255) NOT NULL,
    subject_name VARCHAR(100),
    topic_name VARCHAR(100),
    duration VARCHAR(50) DEFAULT '45 mins',
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE
);

-- 9. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    question_count INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(64) PRIMARY KEY,
    quiz_id VARCHAR(64) REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT
);

-- 11. Quiz Results Table
CREATE TABLE IF NOT EXISTS quiz_results (
    id VARCHAR(64) PRIMARY KEY,
    quiz_id VARCHAR(64) REFERENCES quizzes(id) ON DELETE SET NULL,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    score DECIMAL NOT NULL,
    correct_count INT NOT NULL,
    incorrect_count INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Quiz Answers Table
CREATE TABLE IF NOT EXISTS quiz_answers (
    id VARCHAR(64) PRIMARY KEY,
    quiz_result_id VARCHAR(64) REFERENCES quiz_results(id) ON DELETE CASCADE,
    question_id VARCHAR(64) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option INT NOT NULL,
    is_correct BOOLEAN NOT NULL
);

-- 13. Learning Resources Table
CREATE TABLE IF NOT EXISTS learning_resources (
    id VARCHAR(64) PRIMARY KEY,
    topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) DEFAULT 'article',
    content_url_or_summary TEXT
);

-- 14. AI Chat History Table
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance ideathon lookups
CREATE INDEX IF NOT EXISTS idx_student_perf ON student_performance(student_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results ON quiz_results(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history ON ai_chat_history(student_id, created_at ASC);
CREATE TABLE IF NOT EXISTS search_history (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_search_history ON search_history(student_id, created_at DESC);
"""

class Database:
    def __init__(self):
        self._conn: Optional[pg8000.native.Connection] = None
        self.is_connected = False
        self._database_created = False

    def ensure_database(self) -> bool:
        if self._database_created:
            return True
        admin_conn = None
        try:
            if not settings.DB_NAME:
                raise ValueError("DB_NAME must not be empty")
            admin_conn = pg8000.native.Connection(
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                database="postgres",
                timeout=5,
            )
            existing = admin_conn.run(
                "SELECT 1 FROM pg_database WHERE datname = :database_name",
                database_name=settings.DB_NAME,
            )
            if not existing:
                safe_database_name = settings.DB_NAME.replace('"', '""')
                admin_conn.run(f'CREATE DATABASE "{safe_database_name}"')
                logger.info("Created PostgreSQL database %s.", settings.DB_NAME)
            self._database_created = True
            return True
        except Exception as error:
            logger.warning(
                "Could not create or inspect PostgreSQL database %s (%s). "
                "The app will use its in-memory fallback unless the database exists.",
                settings.DB_NAME,
                error,
            )
            return False
        finally:
            if admin_conn:
                try:
                    admin_conn.close()
                except Exception:
                    logger.warning("Could not close the PostgreSQL administrative connection.")

    def get_connection(self) -> Optional[pg8000.native.Connection]:
        if self._conn and self.is_connected:
            return self._conn

        try:
            self._conn = pg8000.native.Connection(
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                database=settings.DB_NAME,
                timeout=5
            )
            self.is_connected = True
            logger.info("Successfully connected to PostgreSQL via pg8000.")
            return self._conn
        except Exception as e:
            self.is_connected = False
            logger.warning(f"PostgreSQL connection to {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME} not available ({e}). Using resilient in-memory fallback engine.")
            return None

    def initialize_schema(self):
        self.ensure_database()
        conn = self.get_connection()
        if not conn:
            return False
        try:
            for statement in SCHEMA_SQL.split(';'):
                stmt = statement.strip()
                if stmt:
                    conn.run(stmt)
            logger.info("Database schema initialized successfully.")
            return True
        except Exception:
            logger.exception("Error initializing database schema")
            return False

    def get_subjects(self) -> Optional[List[Dict[str, Any]]]:
        conn = self.get_connection()
        if not conn:
            return None

        rows = conn.run(
            """
            SELECT s.id, s.name, s.code, s.icon, s.progress,
                   t.id, t.name, t.score, t.difficulty, t.last_tested
            FROM subjects s
            LEFT JOIN topics t ON t.subject_id = s.id
            ORDER BY s.id, t.order_index, t.id
            """
        )
        subjects: Dict[str, Dict[str, Any]] = {}
        for row in rows:
            subject_id, name, code, icon, progress, topic_id, topic_name, score, difficulty, last_tested = row
            subject = subjects.setdefault(subject_id, {
                "id": subject_id,
                "name": name,
                "code": code,
                "icon": icon,
                "progress": progress,
                "topics": [],
            })
            if topic_id is not None:
                subject["topics"].append({
                    "id": topic_id,
                    "name": topic_name,
                    "score": score,
                    "difficulty": difficulty,
                    "lastTested": last_tested.isoformat() if last_tested else None,
                })
        return list(subjects.values())

    def save_subject(self, subject: Dict[str, Any]) -> bool:
        conn = self.get_connection()
        if not conn:
            return False

        conn.run("BEGIN")
        try:
            conn.run(
                """
                INSERT INTO subjects (id, name, code, icon, progress)
                VALUES (:id, :name, :code, :icon, :progress)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    code = EXCLUDED.code,
                    icon = EXCLUDED.icon,
                    progress = EXCLUDED.progress
                """,
                id=subject["id"],
                name=subject["name"],
                code=subject["code"],
                icon=subject.get("icon", "📚"),
                progress=subject.get("progress", 0),
            )
            current_topic_ids = {topic["id"] for topic in subject.get("topics", [])}
            for (existing_id,) in conn.run(
                "SELECT id FROM topics WHERE subject_id = :subject_id",
                subject_id=subject["id"],
            ):
                if existing_id not in current_topic_ids:
                    conn.run("DELETE FROM topics WHERE id = :topic_id", topic_id=existing_id)

            for index, topic in enumerate(subject.get("topics", []), start=1):
                conn.run(
                    """
                    INSERT INTO topics (id, subject_id, name, difficulty, order_index, score, last_tested)
                    VALUES (:id, :subject_id, :name, :difficulty, :order_index, :score, :last_tested)
                    ON CONFLICT (id) DO UPDATE SET
                        subject_id = EXCLUDED.subject_id,
                        name = EXCLUDED.name,
                        difficulty = EXCLUDED.difficulty,
                        order_index = EXCLUDED.order_index,
                        score = EXCLUDED.score,
                        last_tested = EXCLUDED.last_tested
                    """,
                    id=topic["id"],
                    subject_id=subject["id"],
                    name=topic["name"],
                    difficulty=topic.get("difficulty", "Medium"),
                    order_index=index,
                    score=topic.get("score", 0),
                    last_tested=topic.get("lastTested") or date.today(),
                )
            conn.run("COMMIT")
        except Exception:
            conn.run("ROLLBACK")
            raise
        return True

    def delete_subject(self, subject_id: str) -> Optional[bool]:
        conn = self.get_connection()
        if not conn:
            return None
        rows = conn.run(
            "DELETE FROM subjects WHERE id = :subject_id RETURNING id",
            subject_id=subject_id,
        )
        return bool(rows)

    def get_quiz_history(self, student_id: str) -> Optional[List[Dict[str, Any]]]:
        conn = self.get_connection()
        if not conn:
            return None
        rows = conn.run(
            """
            SELECT id, subject_name, topic_name, score, correct_count,
                   incorrect_count, submitted_at
            FROM quiz_results
            WHERE student_id = :student_id
            ORDER BY submitted_at DESC, id DESC
            """,
            student_id=student_id,
        )
        return [
            {
                "id": row[0],
                "subject": row[1],
                "topic": row[2],
                "score": int(row[3]),
                "total": 100,
                "date": row[6].date().isoformat() if hasattr(row[6], "date") else str(row[6]),
                "status": "Mastered" if row[3] >= 60 else "Needs Review",
                "questionsCount": row[4] + row[5],
            }
            for row in rows
        ]

    def save_quiz_result(self, result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            return None

        result_id = f"q_{uuid.uuid4().hex}"
        conn.run(
            """
            INSERT INTO quiz_results (
                id, student_id, subject_name, topic_name, score, correct_count, incorrect_count
            ) VALUES (
                :id, :student_id, :subject, :topic, :score, :correct_count, :incorrect_count
            )
            """,
            id=result_id,
            student_id=result["studentId"],
            subject=result["subject"],
            topic=result["topic"],
            score=result["score"],
            correct_count=result["correctCount"],
            incorrect_count=result["incorrectCount"],
        )
        submitted = dict(result)
        submitted.update({
            "id": result_id,
            "total": 100,
            "date": date.today().isoformat(),
            "status": "Mastered" if result["score"] >= 60 else "Needs Review",
            "questionsCount": result["questionsCount"],
        })
        return submitted

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            return None
        rows = conn.run(
            "SELECT id, email, hashed_password, full_name, role FROM users WHERE email = :email",
            email=email,
        )
        if not rows:
            return None
        user_id, user_email, password_hash, full_name, role = rows[0]
        return {
            "id": user_id,
            "email": user_email,
            "hashed_password": password_hash,
            "name": full_name,
            "role": role,
        }

    def create_account(self, user: Dict[str, Any]) -> None:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        conn.run("BEGIN")
        try:
            conn.run(
                """
                INSERT INTO users (id, email, hashed_password, full_name, role)
                VALUES (:id, :email, :hashed_password, :full_name, 'student')
                """,
                id=user["id"],
                email=user["email"],
                hashed_password=user["hashed_password"],
                full_name=user["name"],
            )
            conn.run(
                """
                INSERT INTO students (id, user_id, enrollment_no)
                VALUES (:id, :user_id, :enrollment_no)
                """,
                id=user["id"],
                user_id=user["id"],
                enrollment_no=user.get("enrollmentNo"),
            )
            conn.run("COMMIT")
        except Exception:
            conn.run("ROLLBACK")
            raise

    def get_ai_history(self, student_id: str) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        rows = conn.run(
            """
            SELECT id, role, content, created_at
            FROM ai_chat_history
            WHERE student_id = :student_id
            ORDER BY created_at ASC, id ASC
            """,
            student_id=student_id,
        )
        return [
            {
                "id": row[0],
                "role": row[1],
                "content": row[2],
                "createdAt": row[3].isoformat(),
            }
            for row in rows
        ]

    def save_ai_exchange(self, student_id: str, question: str, answer: str) -> None:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        conn.run("BEGIN")
        try:
            for role, content in (("user", question), ("assistant", answer)):
                conn.run(
                    """
                    INSERT INTO ai_chat_history (id, student_id, role, content)
                    VALUES (:id, :student_id, :role, :content)
                    """,
                    id=f"chat_{uuid.uuid4().hex}",
                    student_id=student_id,
                    role=role,
                    content=content,
                )
            conn.run("COMMIT")
        except Exception:
            conn.run("ROLLBACK")
            raise

    def clear_ai_history(self, student_id: str) -> None:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        conn.run("DELETE FROM ai_chat_history WHERE student_id = :student_id", student_id=student_id)

    def get_search_history(self, student_id: str) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        rows = conn.run(
            """
            SELECT id, query, created_at
            FROM search_history
            WHERE student_id = :student_id
            ORDER BY created_at DESC, id DESC
            LIMIT 50
            """,
            student_id=student_id,
        )
        return [
            {"id": row[0], "query": row[1], "createdAt": row[2].isoformat()}
            for row in rows
        ]

    def save_search_query(self, student_id: str, query: str) -> Dict[str, Any]:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        entry_id = f"search_{uuid.uuid4().hex}"
        conn.run(
            """
            INSERT INTO search_history (id, student_id, query)
            VALUES (:id, :student_id, :query)
            """,
            id=entry_id,
            student_id=student_id,
            query=query,
        )
        return {"id": entry_id, "query": query, "createdAt": date.today().isoformat()}

    def delete_search_entry(self, student_id: str, entry_id: str) -> bool:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        rows = conn.run(
            """
            DELETE FROM search_history
            WHERE student_id = :student_id AND id = :entry_id
            RETURNING id
            """,
            student_id=student_id,
            entry_id=entry_id,
        )
        return bool(rows)

    def clear_search_history(self, student_id: str) -> None:
        conn = self.get_connection()
        if not conn:
            raise RuntimeError("Database connection is unavailable")
        conn.run("DELETE FROM search_history WHERE student_id = :student_id", student_id=student_id)

db = Database()
