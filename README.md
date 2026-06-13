# DeskGuard — Library Seat Booking and Anti-Hoarding System

**WebForge Smart Campus Webathon** | IEEE Computational Intelligence Society, Manipal University Jaipur

---

## Problem Statement

Students reserve library desks by leaving their bags and disappearing for hours, leaving other students with no available seats. There is currently no fair, trackable system to manage desk occupancy in real time.

---

## Solution

DeskGuard is a web portal that provides real-time, fair desk management for campus libraries. Each desk displays one of three statuses on a live color-coded map:

| Color | Status | Meaning |
|---|---|---|
| Green | Free | Desk is available to book |
| Red | Occupied | Desk is actively in use |
| Yellow | Away | Student has temporarily stepped away (max 20 minutes) |

Students scan a QR code affixed to each desk to check in. A server-side background job sweeps the database every 60 seconds and automatically releases desks that have exceeded their time limits.

---

## Key Features

| Feature | Description |
|---|---|
| Live Library Map | SVG color-coded grid showing real-time desk occupancy |
| QR Check-In | Students scan a desk QR code to claim a seat |
| Away Mode | Students can pause their session for up to 20 minutes |
| Auto-Abandon | Server-side timer auto-releases desks after 2 hours of inactivity |
| Still Here Prompt | Active confirmation check every 2 hours to verify occupancy |
| Librarian Dashboard | Admin interface to monitor all desks and trigger manual resets |
| Background Sweep Job | APScheduler job runs every 60 seconds to expire timed-out desks |

---

## Tech Stack

| Layer | Tool | Version | Purpose |
|---|---|---|---|
| Frontend framework | React via Vite | 18+ | SVG map, component-based UI |
| Styling | Tailwind CSS | v3 | Utility-first styling |
| State management | Zustand | latest | Lightweight global state |
| Real-time updates | React Query + polling | v5 | Desk status refreshes every 10s |
| HTTP client | Axios | latest | API calls from frontend |
| QR generation | qrcode.react | latest | Generate QR code per desk |
| Backend framework | FastAPI | 0.110+ | Async Python backend, auto Swagger docs |
| Background scheduler | APScheduler | 3.x | 60-second sweep job inside FastAPI |
| Auth | JWT via python-jose | latest | Student and librarian role management |
| Password hashing | passlib[bcrypt] | latest | Secure password storage |
| Database ORM | SQLAlchemy | 2.x async | Database models |
| DB migrations | Alembic | latest | Schema versioning |
| Database | PostgreSQL | 15 | Supabase free tier (hosted) |
| DB driver | asyncpg | latest | Async PostgreSQL for FastAPI |
| Env management | python-dotenv | latest | Load .env variables |
| CORS | FastAPI middleware | built-in | Allow React to FastAPI calls |
| Frontend hosting | Vercel | — | Free, Git-connected auto-deploy |
| Backend hosting | Railway | — | Free tier, always-on Python server |
| Version control | GitHub | — | README and env vars documented |

---

## Project Structure

```
deskguard/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── LibraryMap.jsx
│   │   │   ├── CheckIn.jsx
│   │   │   └── LibrarianDash.jsx
│   │   ├── components/
│   │   │   ├── DeskGrid.jsx
│   │   │   ├── DeskCell.jsx
│   │   │   └── Navbar.jsx
│   │   └── App.jsx
├── backend/                   # FastAPI application
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── jobs/                  # APScheduler sweep job
│   ├── alembic/               # DB migrations
│   └── main.py
├── docs/
│   ├── ARCHITECTURE.md
│   └── WORKFLOW.md
└── README.md
```

---

## How to Run

### Prerequisites

- Node.js v18+
- Python 3.11+
- PostgreSQL 15 (or a Supabase project)

### 1. Clone the repository

```bash
git clone https://github.com/Sakshi100503/Deskguard-Library-seat-booking-and-Anti-hoarding-App.git
cd Deskguard-Library-seat-booking-and-Anti-hoarding-App
```

### 2. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

### 3. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/deskguard
SECRET_KEY=your_jwt_secret_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn main:app --reload
```

### 4. Access the application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | https://deskguard.vercel.app *(to be updated)* |
| Backend API | https://deskguard-api.up.railway.app *(to be updated)* |

---

## Build Phases

| Phase | Description |
|---|---|
| Phase 1 | Project scaffold — monorepo setup, folder structure, git init |
| Phase 2 | Database and backend core — PostgreSQL schema, SQLAlchemy models, Alembic migrations, JWT auth |
| Phase 3 | Desk API and scheduler — check-in, away, release endpoints, 60s APScheduler sweep job |
| Phase 4 | React frontend and SVG map — Vite setup, Tailwind, color-coded desk map, status polling |
| Phase 5 | Away flow and librarian dashboard — 20-min away timer, Still Here prompt, librarian reset UI |
| Phase 6 | QR codes, deploy, and README — QR per desk, Vercel and Railway deploy, env vars documented |

---

## Team

| Name | Role |
|---|---|
| Sakshi | Full-Stack Developer |
| Viru | Documentation and Repository |

---

## Future Scope

- Mobile application with push notifications for desk expiry alerts
- ML-based peak hour prediction to suggest optimal study times
- Integration with student ID cards for automated check-in
- Analytics dashboard for library administrators
- Multi-floor library support with floor selector

---

## License

MIT License. See [LICENSE](LICENSE) for details.
