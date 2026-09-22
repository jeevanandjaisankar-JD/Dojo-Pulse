# Dojo-Pulse 🥋⚡
### Full-Stack Belt Analytics Platform for Kalvium Dojo Mentors

Dojo-Pulse is a dedicated monitoring and statistical analysis suite designed for mentors to track student belt advancements, test slots, and improvement trajectories across the Kalvium Dojo problem-solving program.

---

## 🏛️ Architecture Overview

The codebase is structured into three clean, decoupled tiers:

```
Dojo-Pulse/
├── package.json                   # Root orchestrator scripts
├── .gitignore                     # Git ignore rules across all tiers
├── README.md                      # Documentation & team guide
│
├── frontend/                      # Tier 1: Vite + React + Tailwind CSS
│   ├── src/
│   │   ├── components/            # Layout, Navbar (top-right mentor profile), Sidebar, Banner, StatCard
│   │   ├── context/               # AuthContext (mentor login state & guards)
│   │   ├── pages/                 # Login, Dashboard, Students, StudentDetail, Improvements, DataUpload, Profile
│   │   └── services/              # API client methods with JWT bearer auth
│   ├── vite.config.js             # Vite dev server + proxy to backend
│   └── tailwind.config.js
│
├── backend/                       # Tier 2: Node.js + Express + MongoDB (Mongoose)
│   ├── src/
│   │   ├── config/                # MongoDB connection & designated Mentor (Aravind)
│   │   ├── controllers/           # Auth, Dashboard, Students, Improvements, Upload
│   │   ├── middlewares/           # JWT authMiddleware & Multer file uploadMiddleware
│   │   ├── models/                # Student, DojoSlot, UploadHistory Mongoose schemas
│   │   ├── routes/                # Express API endpoints
│   │   ├── services/              # Python runner (spawns Pandas cleaner)
│   │   ├── app.js                 # Express app config
│   │   └── server.js              # Port listener & DB init
│   └── uploads/                   # Stored uploaded CSV files
│
└── data_processor/                # Tier 3: Python + Pandas Data Pipeline
    ├── cleaner.py                 # Core pandas data normalization, belt math & same-day grouping
    ├── run_pipeline.py            # CLI entrypoint called by Node.js backend
    ├── requirements.txt           # Python dependencies (pandas, openpyxl, etc.)
    └── .venv/                     # Python virtual environment
```

---

## 🔐 Designated Mentor

Access to the portal is controlled and restricted to mentor **Aravind** (configured in `backend/src/config/mentors.js`).

| Username | Password | Mentor Name | Assigned Track |
| :--- | :--- | :--- | :--- |
| `mentor1` | `Aravind@123` | Aravind | Growth & Development |

> **Note**: On the login screen, an **Auto Fill** button is provided for one-click login testing.

---

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: 3.10+ (tested on Python 3.14)
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/dojo_pulse`) or MongoDB Atlas.

---

### 2. Running the Application

```bash
# Run both Backend & Frontend concurrently
npm run dev

# Or run individually:
npm run dev:backend   # Express API on http://localhost:5000
npm run dev:frontend  # Vite React App on http://localhost:3000
```