# DeskGuard — Library Seat Booking & Anti-Hoarding System

A web portal that solves the desk-hoarding problem in libraries. Students scan a QR code to check in, the map shows live availability, and a background job auto-expires abandoned desks every 60 seconds.

## Features
- Live color-coded desk map (Green = Free, Red = Occupied, Yellow = Away)
- QR code check-in per desk
- Away mode with 20-minute timer
- "Still here?" prompt after 2 hours
- Auto-abandon if no response
- Librarian dashboard with manual reset

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI + APScheduler
- **Database**: PostgreSQL
- **Auth**: JWT

---

## How to Run

### Prerequisites
- Python 3.11+
- Node 18+
- PostgreSQL 15 running locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env          # then fill in your values
python seed_desks.py          # creates tables + seeds 20 desks
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env          # then fill in your values
npm run dev
```

App runs at: http://localhost:5173

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL async connection string | `postgresql+asyncpg://postgres:password@localhost:5432/deskguard` |
| `SECRET_KEY` | JWT signing secret (change in production) | `your-random-secret-key` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `60` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## Deployment

- **Frontend** → Vercel (connect GitHub repo, set `VITE_API_URL` in Vercel env vars)
- **Backend** → Railway (connect GitHub repo, set all backend env vars in Railway dashboard)
