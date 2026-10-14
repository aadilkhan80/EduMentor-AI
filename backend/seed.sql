-- ==========================================================
-- EduMentor AI - PostgreSQL Complete Schema & Seed Data Script
-- ==========================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students
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

-- 3. Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50) NOT NULL,
    icon VARCHAR(20) DEFAULT '📚',
    description TEXT,
    progress INT DEFAULT 0
);

-- 4. Topics
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(64) PRIMARY KEY,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    order_index INT DEFAULT 1,
    score INT DEFAULT 50,
    last_tested DATE DEFAULT CURRENT_DATE
);

-- 5. Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_id VARCHAR(64) REFERENCES subjects(id) ON DELETE CASCADE,
    total_marks DECIMAL DEFAULT 100.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Student Performance
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

-- 7. Study Plans
CREATE TABLE IF NOT EXISTS study_plans (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    goal VARCHAR(255),
    total_days INT DEFAULT 7,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Study Plan Items
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

-- 9. Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    question_count INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(64) PRIMARY KEY,
    quiz_id VARCHAR(64) REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT
);

-- 11. Quiz Results
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

-- 12. Quiz Answers
CREATE TABLE IF NOT EXISTS quiz_answers (
    id VARCHAR(64) PRIMARY KEY,
    quiz_result_id VARCHAR(64) REFERENCES quiz_results(id) ON DELETE CASCADE,
    question_id VARCHAR(64) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option INT NOT NULL,
    is_correct BOOLEAN NOT NULL
);

-- 13. Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id VARCHAR(64) PRIMARY KEY,
    topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) DEFAULT 'article',
    content_url_or_summary TEXT
);

-- 14. AI Chat History
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES students(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- Sample Seed Data for Immediate Ideathon Demo
-- ==========================================================

INSERT INTO users (id, email, hashed_password, full_name, role)
VALUES ('usr_01', 'alex.johnson@university.edu', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Alex Johnson', 'student')
ON CONFLICT (email) DO NOTHING;

INSERT INTO students (id, user_id, enrollment_no, grade_or_semester, target_exam_or_goal, day_streak, study_minutes_today, daily_goal_minutes)
VALUES ('std_01', 'usr_01', 'EDU-2026-084', 'Computer Science (Sem 4)', 'GATE & Semester Exams', 7, 42, 60)
ON CONFLICT (enrollment_no) DO NOTHING;

INSERT INTO subjects (id, name, code, icon, progress)
VALUES 
('sub_1', 'Database Management (DBMS)', 'CS301', '🗄️', 65),
('sub_2', 'Data Structures & Algorithms (DSA)', 'CS302', '💻', 58),
('sub_3', 'Python Programming', 'CS204', '🐍', 82),
('sub_4', 'Discrete Mathematics', 'MA201', '📐', 74)
ON CONFLICT (id) DO NOTHING;

INSERT INTO topics (id, subject_id, name, difficulty, score)
VALUES 
('top_1', 'sub_1', 'SQL & Relational Algebra', 'Medium', 82),
('top_2', 'sub_1', 'ER Modeling & Relational Design', 'Easy', 76),
('top_3', 'sub_1', 'Normalization (1NF, 2NF, 3NF, BCNF)', 'Hard', 42),
('top_4', 'sub_1', 'Transactions & Concurrency Control', 'Hard', 48),
('top_5', 'sub_1', 'Indexing & B-Trees', 'Medium', 70),
('top_6', 'sub_2', 'Arrays & Two Pointers', 'Easy', 85),
('top_7', 'sub_2', 'Trees & Binary Search Trees', 'Medium', 68),
('top_8', 'sub_2', 'Dynamic Programming & Memoization', 'Hard', 38),
('top_9', 'sub_2', 'Graph Algorithms (BFS/DFS, Dijkstra)', 'Hard', 50),
('top_10', 'sub_3', 'Data Types & Control Flow', 'Easy', 92),
('top_11', 'sub_3', 'OOP & Classes', 'Medium', 84),
('top_12', 'sub_3', 'Decorators & Generators', 'Hard', 70),
('top_13', 'sub_4', 'Propositional Logic', 'Easy', 88),
('top_14', 'sub_4', 'Combinatorics & Probability', 'Medium', 72),
('top_15', 'sub_4', 'Recurrence Relations', 'Hard', 55)
ON CONFLICT (id) DO NOTHING;
