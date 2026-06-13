# DeskGuard — System Architecture

## Overview

DeskGuard follows a client-server architecture with a React frontend, a FastAPI backend, PostgreSQL for persistent storage, and an APScheduler background job for server-side timer management. The frontend polls the backend every 10 seconds via React Query to reflect real-time desk status changes.

---

## Architecture Diagram

```
+-------------------------------------------------------------+
|                     FRONTEND (React + Vite)                 |
|                                                             |
|  +---------------+  +----------------+  +---------------+  |
|  |  Landing Page |  | Library Map    |  | Librarian     |  |
|  |               |  | (SVG Grid)     |  | Dashboard     |  |
|  +---------------+  +----------------+  +---------------+  |
|                                                             |
|  State: Zustand       Data fetching: React Query (10s poll) |
+---------------------------+---------------------------------+
                            | HTTP / REST (Axios)
                            v
+-------------------------------------------------------------+
|                  BACKEND (FastAPI + Python)                  |
|                                                             |
|  +---------------+  +----------------+  +---------------+  |
|  | /auth         |  | /desks         |  | /librarian    |  |
|  | JWT Auth      |  | Check-in, Away |  | Admin Routes  |  |
|  | python-jose   |  | Release, Status|  | Manual Reset  |  |
|  +---------------+  +----------------+  +---------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  |           APScheduler Background Job (60s)            |  |
|  |  - Queries all occupied and away desks                |  |
|  |  - Compares current time against check-in timestamps  |  |
|  |  - Auto-expires desks that have exceeded time limits  |  |
|  |  - Updates status to "abandoned" in PostgreSQL        |  |
|  +-------------------------------------------------------+  |
+---------------------------+---------------------------------+
                            |
              +-------------+-------------+
              |                           |
    +---------v----------+    +-----------v--------+
    |    PostgreSQL 15   |    |   Supabase (hosted)|
    |                    |    |                    |
    |  - users           |    |  Free tier         |
    |  - desks           |    |  Managed DB        |
    |  - bookings        |    |  Connection pooling|
    |  - audit_logs      |    |                    |
    +--------------------+    +--------------------+
```

---

## Component Breakdown

### Frontend Components

| Component | Responsibility |
|---|---|
| `LibraryMap.jsx` | Renders the SVG grid of all desks with live color states |
| `DeskGrid.jsx` | Maps the desk data array to individual DeskCell SVG elements |
| `DeskCell.jsx` | Single desk unit — color-coded, clickable, displays status tooltip |
| `CheckIn.jsx` | Handles QR scan, check-in confirmation, and API call |
| `LibrarianDash.jsx` | Table of all desks with status, timestamps, and manual reset buttons |
| `Navbar.jsx` | Top navigation with role-based links (student vs librarian) |

### Backend Modules

| Module | Responsibility |
|---|---|
| `routers/auth.py` | Student and librarian login, JWT token issuance |
| `routers/desks.py` | GET all desks, POST check-in, PATCH away/return, DELETE release |
| `routers/librarian.py` | Admin-only routes: manual desk reset, audit log view |
| `jobs/sweeper.py` | APScheduler job — runs every 60s, expires timed-out desks |
| `models/desk.py` | SQLAlchemy desk model: id, status, student_id, checkin_at, away_at |
| `models/user.py` | SQLAlchemy user model: id, name, email, role, hashed_password |
| `alembic/` | Database migration scripts managed via Alembic |

---

## Desk Status State Machine

```
         +---------+
         |  FREE   | <------------------------------------+
         +---------+                                      |
              |                                           |
              | Student scans QR and checks in            |
              v                                           |
         +----------+   2hr inactivity / no response  +------------+
         | OCCUPIED | --------------------------------> | ABANDONED  |
         +----------+                                  +------------+
              |                                             ^
              | Student clicks "Away"                       |
              v                                             |
         +---------+   20 min timeout                       |
         |  AWAY   | --------------------------------------+
         +---------+
              |
              | Student clicks "I'm Back"
              v
         OCCUPIED
```

---

## Timer Logic

All timers are managed server-side. The browser never controls desk expiry.

- On check-in: the desk record is updated with `checkin_at = now()` in PostgreSQL
- On Away: the desk record is updated with `away_at = now()` and status set to `away`
- The APScheduler job runs every 60 seconds and queries all desks where:
  - `status = 'occupied'` and `now() - checkin_at > 2 hours` (triggers Still Here prompt, then abandons)
  - `status = 'away'` and `now() - away_at > 20 minutes` (auto-abandons)
- Expired desks are updated to `status = 'abandoned'` and the student association is cleared

---

## Database Schema

### desks table

```sql
CREATE TABLE desks (
    id          SERIAL PRIMARY KEY,
    label       VARCHAR(10) NOT NULL,
    status      VARCHAR(20) DEFAULT 'free',
    student_id  INTEGER REFERENCES users(id),
    checkin_at  TIMESTAMP,
    away_at     TIMESTAMP,
    floor       INTEGER DEFAULT 1,
    section     VARCHAR(5)
);
```

### users table

```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100),
    email           VARCHAR(100) UNIQUE NOT NULL,
    role            VARCHAR(20) DEFAULT 'student',
    hashed_password VARCHAR(255) NOT NULL
);
```

### audit_logs table

```sql
CREATE TABLE audit_logs (
    id          SERIAL PRIMARY KEY,
    desk_id     INTEGER REFERENCES desks(id),
    student_id  INTEGER REFERENCES users(id),
    action      VARCHAR(50),
    created_at  TIMESTAMP DEFAULT now()
);
```

---

## Deployment Architecture

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Git-connected, auto-deploys on push to main |
| Backend API | Railway | Always-on Python server, free tier |
| Database | Supabase (PostgreSQL 15) | Managed, free tier |
| API Documentation | FastAPI Swagger UI | Available at /docs on the backend URL |
