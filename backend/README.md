# EduMentor AI - Backend

FastAPI backend for EduMentor AI - "Learn Smarter. Improve Faster."

## Features
- Pure Python PostgreSQL connector using `pg8000`
- Modular architecture (Routes, Services, Models, Schemas, Utils)
- JWT-based authentication with bcrypt password hashing
- Account registration with account-scoped search and AI chat history
- Adaptive Weak-Topic Detection engine
- LLM API integration with fallback resilience
- AI Quiz generation and automated evaluation

## Quick Start
1. Create virtual environment:
   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and fill in credentials.
4. Run server:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

## PostgreSQL persistence

Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `backend/.env`.
On startup, the backend creates the configured database if it does not exist, initializes the schema, and seeds the demo subjects and quiz history if those tables are empty. The PostgreSQL role must be allowed to create databases. Accounts, subject/topic changes, quiz results, AI exchanges, and search history are stored in PostgreSQL; if PostgreSQL is unavailable, the demo uses in-memory data.

Set a private, stable `SECRET_KEY` of at least 32 characters in `.env`. Without it, the backend generates a development-only key each time it starts.
