# 🔄 DeskGuard — User Flow & Workflow Documentation

## User Roles

| Role | Access |
|---|---|
| **Student** | View map, check in, mark away, release desk |
| **Librarian** | View all desks, manually reset any desk, view audit logs |

---

## Workflow 1: Student Check-In

**Goal:** Student wants to book a desk in the library.

```
Step 1: Student opens DeskGuard on phone/laptop
        → Sees the Library Map page
        → Color-coded desk grid (Green = Free, Red = Occupied, Yellow = Away)

Step 2: Student finds a Green (free) desk
        → Walks to the desk physically
        → Scans the QR code sticker on the desk

Step 3: QR scan opens the Check-In page
        → Shows desk label (e.g. "Desk A4")
        → Student clicks "Check In"

Step 4: API call → Backend sets desk status to "occupied"
        → Redis timer starts: 2-hour countdown begins (server-side)
        → Map updates: Desk turns Red in real time

Step 5: Student is now officially checked in
        → Desk shows their session on the map
```

---

## Workflow 2: Student Going Away Temporarily

**Goal:** Student needs to leave briefly (bathroom, water, etc.) without losing their seat.

```
Step 1: Student clicks "I'll Be Back" (Away button) on their active session

Step 2: API call → Backend sets desk status to "away"
        → Redis away-timer starts: 20-minute countdown (server-side)
        → Map updates: Desk turns Yellow

Step 3a (Happy Path): Student returns within 20 minutes
        → Clicks "I'm Back"
        → Desk returns to Red (occupied)
        → Main 2-hour timer resumes

Step 3b (Timeout): Student doesn't return in 20 minutes
        → Sweeper job detects away-timer expired
        → Desk status → "abandoned"
        → Map updates: Desk turns Green (freed)
```

---

## Workflow 3: "Still Here?" Prompt

**Goal:** Prevent ghost occupancy where student left without checking out.

```
Step 1: Every 2 hours, the backend sweeper checks occupied desks

Step 2: For any desk occupied for 2 hours with no interaction:
        → Sends a "Still Here?" notification/prompt to the student

Step 3a: Student responds "Yes, still here"
        → 2-hour timer resets
        → Desk stays Red

Step 3b: Student doesn't respond (15-minute grace period)
        → Desk status → "abandoned"
        → Desk freed on the map (turns Green)
```

---

## Workflow 4: Manual Librarian Reset

**Goal:** Librarian needs to override and free a desk (e.g., student left their bag).

```
Step 1: Librarian logs in with librarian credentials
        → Sees Librarian Dashboard

Step 2: Dashboard shows table of all desks:
        | Desk | Status   | Student     | Check-in Time | Timer  |
        | A1   | Occupied | Riya Sharma | 10:30 AM      | 1h 20m |
        | B3   | Away     | Ankit Kumar | 11:00 AM      | 8m     |
        | C2   | Abandoned| —           | —             | —      |

Step 3: Librarian clicks "Reset" on any desk

Step 4: API call → Backend clears desk record in PostgreSQL
        → Deletes timer keys from Redis
        → Desk returns to "free" status
        → Map updates in real time
```

---

## Workflow 5: Student Check-Out

**Goal:** Student is done studying and wants to release their desk.

```
Step 1: Student clicks "End Session" on their active desk screen

Step 2: API call → Backend sets desk status to "free"
        → Clears Redis timer keys for that desk
        → Logs session duration in audit_logs table

Step 3: Map updates: Desk turns Green
        → Available for the next student immediately
```

---

## Page-by-Page User Flow Summary

```
Landing Page (/)
    │
    ├── [Student] → Click "Find a Seat" → Library Map (/map)
    │                   │
    │                   ├── Click free desk → Scan QR → Check In (/checkin/:deskId)
    │                   │                                    │
    │                   │                             Active Session
    │                   │                             ├── "Away" → Yellow
    │                   │                             ├── "I'm Back" → Red
    │                   │                             └── "End Session" → Green
    │                   │
    │                   └── View desk status (read-only for non-checked-in users)
    │
    └── [Librarian] → Click "Librarian Login" → Dashboard (/librarian)
                            │
                            ├── View all desks + timers
                            ├── Reset any desk
                            └── View audit log
```

---

## Key Business Rules

| Rule | Details |
|---|---|
| One desk per student | A student cannot check in to 2 desks simultaneously |
| Away limit | Maximum 20 minutes. Exceeded → auto-abandoned |
| Session limit | Maximum 2 hours before "Still Here?" prompt |
| Timer location | All timers run server-side. Client never controls expiry |
| QR uniqueness | Each desk has a unique QR code mapped to its desk ID |
| Librarian override | Librarian can reset any desk at any time without restrictions |
