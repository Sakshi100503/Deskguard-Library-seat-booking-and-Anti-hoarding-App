# 🛡️ DeskGuard — Library Seat Booking & Anti-Hoarding App

> **WebForge Smart Campus Webathon** · IEEE CIS, Manipal University Jaipur  
> Built by Team [Your Team Name]

---

## 📌 The Problem

Students reserve library desks with their bags and disappear for hours, leaving other students with nowhere to study. There is no fair, trackable system to manage desk occupancy in real time.

---

## 💡 Our Solution

DeskGuard is a web portal that brings **real-time, fair desk management** to any campus library.

- 🟢 **Green** = Desk is free — available to book
- 🔴 **Red** = Desk is occupied
- 🟡 **Yellow** = Student marked "Away" (up to 20 minutes)

Students scan a **QR code** on the desk to check in. If they don't respond to a *"Still here?"* prompt every 2 hours, the desk is automatically marked **Abandoned** and freed for others.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ Live Library Map | SVG color-coded grid showing real-time desk status |
| 📱 QR Check-In | Students scan desk QR code to claim a seat |
| ⏸️ Away Mode | Pause session for up to 20 minutes |
| ⏰ Auto-Abandon | Server-side timer auto-frees desks after 2 hours of inactivity |
| 🔔 Still Here? Prompt | Active check every 2 hours to confirm occupancy |
| 👩‍💼 Librarian Dashboard | Admin view to monitor and manually reset any desk |
| 🕓 Background Job | Sweeps database every minute to expire timed-out desks |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Map Rendering | SVG (inline React components) |
| Backend | Node.js / Express |
| Database | PostgreSQL |
| Timer State | Redis |
| Auth | JWT |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+
- PostgreSQL
- Redis

### 1. Clone the repository
```bash
git clone https://github.com/Sakshi100503/Deskguard-Library-seat-booking-and-Anti-hoarding-App.git
cd Deskguard-Library-seat-booking-and-Anti-hoarding-App
```

### 2. Install frontend dependencies
```bash
cd frontend
npm install
```

### 3. Install backend dependencies
```bash
cd ../backend
npm install
```

### 4. Set up environment variables

Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/deskguard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
```

Create a `.env` file inside the `frontend/` folder:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Run the app

Start backend:
```bash
cd backend
npm run dev
```

Start frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173`

---

## 🌐 Live Demo

> 🔗 [Deployed App on Vercel](https://your-vercel-link.vercel.app) *(link will be updated)*

---

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Hero page
│   │   │   ├── LibraryMap.jsx    # Live SVG desk map
│   │   │   ├── CheckIn.jsx       # QR check-in screen
│   │   │   └── LibrarianDash.jsx # Admin dashboard
│   │   ├── components/
│   │   │   ├── DeskGrid.jsx      # SVG desk grid
│   │   │   ├── DeskCard.jsx      # Individual desk component
│   │   │   └── Navbar.jsx
│   │   └── App.jsx
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── jobs/                     # Background sweep job
│   └── server.js
├── docs/
│   ├── ARCHITECTURE.md
│   └── WORKFLOW.md
└── README.md
```

---

## 👥 Team

| Name | Role |
|---|---|
| Sakshi | Full-Stack Developer |
| [Your Name] | Documentation & Repository |

---

## 🔮 Future Scope

- Mobile app with push notifications for desk expiry alerts
- ML-based peak hour prediction to suggest best study times
- Integration with student ID cards for automated check-in
- Analytics dashboard for library administrators
- Multi-floor library support with floor selector

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
