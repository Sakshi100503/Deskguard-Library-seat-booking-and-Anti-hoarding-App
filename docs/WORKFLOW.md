# DeskGuard — User Flow and Workflow Documentation

## User Roles

| Role | Access Level |
|---|---|
| Student | View map, check in to a desk, mark away, release desk |
| Librarian | View all desks, manually reset any desk, view audit logs |

---

## Workflow 1: Student Check-In

**Objective:** A student wants to reserve a desk in the library.

```
1. Student opens DeskGuard in a browser on their phone or laptop.
   The Library Map page loads, showing a color-coded SVG grid of all desks.

2. Student identifies a green (free) desk on the map.
   They walk to that desk physically.

3. Student scans the QR code sticker on the desk.
   The Check-In page opens, showing the desk label (e.g., "Desk A4").

4. Student clicks "Check In".
   - API call: POST /desks/{id}/checkin
   - Backend sets desk status to "occupied" and records checkin_at timestamp.
   - Map updates: desk turns red.

5. Student is now officially checked in.
   The 2-hour server-side session timer begins.
```

---

## Workflow 2: Student Marking Away

**Objective:** A student needs to leave briefly without losing their seat.

```
1. Student clicks the "Away" button on their active session screen.

2. API call: PATCH /desks/{id}/away
   - Backend sets desk status to "away" and records away_at timestamp.
   - 20-minute server-side away timer begins.
   - Map updates: desk turns yellow.

3a. Happy path — Student returns within 20 minutes:
    Student clicks "I'm Back".
    - Desk status returns to "occupied".
    - away_at is cleared. Main 2-hour timer continues.

3b. Timeout — Student does not return within 20 minutes:
    APScheduler sweep job detects the expired away timer.
    - Desk status is set to "abandoned".
    - Map updates: desk turns green (freed for others).
```

---

## Workflow 3: Still Here Prompt

**Objective:** Prevent ghost occupancy where a student left without checking out.

```
1. Every 60 seconds, the APScheduler sweep job checks all occupied desks.

2. For any desk occupied for 2 hours with no activity:
   - A "Still Here?" notification is sent to the student.

3a. Student responds "Yes, still here":
    - checkin_at timestamp is reset.
    - Desk remains occupied (red).

3b. Student does not respond within a 15-minute grace period:
    - Desk status is set to "abandoned".
    - Desk is freed on the map (turns green).
    - Action is recorded in audit_logs.
```

---

## Workflow 4: Librarian Manual Reset

**Objective:** A librarian needs to override and free a desk, for example when a student has left their belongings.

```
1. Librarian logs in with librarian credentials at /librarian.

2. The Librarian Dashboard loads, showing a table of all desks:

   Desk | Status   | Student      | Check-in Time | Timer Remaining
   -----|----------|--------------|---------------|----------------
   A1   | Occupied | Riya Sharma  | 10:30 AM      | 1h 20m
   B3   | Away     | Ankit Kumar  | 11:00 AM      | 8m remaining
   C2   | Abandoned| —            | —             | —

3. Librarian clicks "Reset" on any desk.

4. API call: POST /librarian/desks/{id}/reset
   - Backend clears desk record: status set to "free", student_id and timestamps cleared.
   - Action is logged in audit_logs with librarian ID.
   - Map updates in real time: desk turns green.
```

---

## Workflow 5: Student Check-Out

**Objective:** Student has finished studying and wants to voluntarily release their desk.

```
1. Student clicks "End Session" on their active session screen.

2. API call: DELETE /desks/{id}/release
   - Backend sets desk status to "free".
   - student_id, checkin_at, and away_at are cleared.
   - Session duration is recorded in audit_logs.

3. Map updates: desk turns green.
   The desk is immediately available for the next student.
```

---

## Complete Page Flow

```
Landing Page (/)
    |
    |-- [Student] --> "Find a Seat" --> Library Map (/map)
    |                                       |
    |                                       |-- Click free desk --> Scan QR --> Check In (/checkin/:deskId)
    |                                                                               |
    |                                                                    Active Session Screen
    |                                                                    |-- "Away"       --> desk turns yellow
    |                                                                    |-- "I'm Back"   --> desk turns red
    |                                                                    |-- "End Session"--> desk turns green
    |
    |-- [Librarian] --> "Librarian Login" --> Dashboard (/librarian)
                                                |
                                                |-- View all desks with live status and timers
                                                |-- Reset any desk manually
                                                |-- View audit log of all actions
```

---

## Business Rules

| Rule | Detail |
|---|---|
| One desk per student | A student cannot be checked in to more than one desk at a time |
| Away time limit | Maximum 20 minutes. Exceeded: desk is auto-abandoned |
| Session time limit | Maximum 2 hours before a Still Here prompt is issued |
| Timer enforcement | All timers run server-side. The client has no control over expiry |
| QR code uniqueness | Each desk has a unique QR code mapped to its desk ID in the database |
| Librarian override | Librarians can reset any desk at any time without restriction |
| Audit logging | All check-in, release, away, and reset actions are recorded in audit_logs |

---

## Build Phase Reference

| Phase | Scope |
|---|---|
| Phase 1 | Project scaffold — monorepo setup, folder structure, git init, README skeleton |
| Phase 2 | Database and backend core — PostgreSQL schema, SQLAlchemy models, Alembic migrations, JWT auth |
| Phase 3 | Desk API and scheduler — check-in, away, release endpoints, 60s APScheduler sweep job |
| Phase 4 | React frontend and SVG map — Vite setup, Tailwind CSS, color-coded desk map, React Query polling |
| Phase 5 | Away flow and librarian dashboard — 20-min away timer, Still Here prompt, librarian reset UI |
| Phase 6 | QR codes, deployment, and documentation — QR per desk, Vercel and Railway deploy, env vars documented |
