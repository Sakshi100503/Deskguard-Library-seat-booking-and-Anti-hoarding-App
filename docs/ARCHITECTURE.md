# 🏗️ DeskGuard — System Architecture

## Overview

DeskGuard follows a **client-server architecture** with a React frontend, a Node.js/Express REST API backend, PostgreSQL for persistent storage, and Redis for managing server-side desk timers.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Landing    │  │  Library Map │  │ Librarian Dashboard│  │
│  │  Page       │  │  (SVG Grid)  │  │ (Admin Panel)     │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                          │                                   │
│                   React Router DOM                           │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP / REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js / Express)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  /auth       │  │  /desks      │  │  /librarian      │  │
│  │  JWT Auth    │  │  CRUD + QR   │  │  Admin Routes    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Background Sweep Job (cron)             │    │
│  │  Runs every 60 seconds                               │    │
│  │  → Checks all desks with active/away timers          │    │
│  │  → Auto-expires desks past their time limit          │    │
│  │  → Updates desk status to "free" in DB               │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────┬───────────────────┘
                     │                    │
          ┌──────────▼──────┐   ┌─────────▼────────┐
          │   PostgreSQL     │   │      Redis        │
          │                  │   │                   │
          │  - users         │   │  - desk:{id}:     │
          │  - desks         │   │    checkin_time   │
          │  - bookings      │   │  - desk:{id}:     │
          │  - audit_logs    │   │    away_time      │
          └──────────────────┘   └───────────────────┘
```

---

## Component Breakdown

### Frontend

| Component | Responsibility |
|---|---|
| `LibraryMap.jsx` | Renders the SVG grid of all desks with live color states |
| `DeskGrid.jsx` | Maps desk data array to individual DeskCell SVG elements |
| `DeskCell.jsx` | Single desk — color coded, clickable, shows status tooltip |
| `CheckIn.jsx` | Handles QR scan → check-in confirmation → API call |
| `LibrarianDash.jsx` | Table of all desks with manual reset buttons |
| `Navbar.jsx` | Top navigation with role-based links |

### Backend

| Module | Responsibility |
|---|---|
| `routes/desks.js` | GET all desks, POST check-in, PATCH away/return, DELETE release |
| `routes/auth.js` | Student & librarian login, JWT token issue |
| `routes/librarian.js` | Admin-only: manual reset, view logs |
| `jobs/sweeper.js` | Cron job — runs every 60s, expires timed-out desks |
| `models/Desk.js` | Desk schema: id, status, studentId, checkinTime, awayTime |

---

## Desk Status State Machine

```
         ┌─────────┐
         │  FREE   │ ◄─────────────────────────────┐
         └────┬────┘                                │
              │ Student scans QR                    │
              ▼                                     │
         ┌──────────┐   2hr no response        ┌────┴──────┐
         │ OCCUPIED │ ─────────────────────► │ ABANDONED │
         └────┬─────┘                          └───────────┘
              │ Student clicks "Away"               ▲
              ▼                                     │
         ┌─────────┐   20 min timeout               │
         │  AWAY   │ ───────────────────────────────┘
         └────┬────┘
              │ Student clicks "I'm Back"
              └──────────────► OCCUPIED
```

---

## Timer Logic (Server-Side Only)

All timers run **server-side** — never in the browser.

- On check-in: `Redis.set("desk:{id}:checkin", timestamp, EX 7200)` (2 hours)
- On Away: `Redis.set("desk:{id}:away", timestamp, EX 1200)` (20 minutes)
- Sweeper job queries all active desks and compares current time vs stored timestamps
- Expired desks are updated to `status: 'abandoned'` in PostgreSQL and key deleted from Redis

---

## Database Schema

### `desks` table
```sql
CREATE TABLE desks (
  id          SERIAL PRIMARY KEY,
  label       VARCHAR(10) NOT NULL,   -- e.g. "A1", "B3"
  status      VARCHAR(20) DEFAULT 'free',  -- free | occupied | away | abandoned
  student_id  INTEGER REFERENCES users(id),
  checkin_at  TIMESTAMP,
  away_at     TIMESTAMP,
  floor       INTEGER DEFAULT 1,
  section     VARCHAR(5)
);
```

### `users` table
```sql
CREATE TABLE users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100),
  email     VARCHAR(100) UNIQUE,
  role      VARCHAR(20) DEFAULT 'student',  -- student | librarian
  password  VARCHAR(255)
);
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | `https://deskguard.vercel.app` |
| Backend API | Render | `https://deskguard-api.onrender.com` |
| Database | Render PostgreSQL | Managed |
| Redis | Render Redis | Managed |
