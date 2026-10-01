# ⛩️ Dojo-Pulse

### Full-Stack Belt Analytics & Student Progress Tracking Platform

Dojo-Pulse is a full-stack web application designed for **Kalvium Dojo mentors** to monitor student progress, analyze belt advancement, track improvement, and manage Dojo assessment data through a centralized dashboard.

The platform combines a React-based mentor portal, an Express/Node.js API, MongoDB persistence, and a Python/Pandas data-processing pipeline.

---

## 📌 Overview

Dojo-Pulse helps mentors transform raw Dojo assessment data into meaningful progress information.

### Core capabilities

* 🔐 Restricted mentor authentication
* 📊 Mentor dashboard with cohort statistics
* 👨‍🎓 Student search and progress tracking
* ⛩️ Belt progression analytics
* 📈 Improvement and performance analytics
* 📁 CSV/Excel Dojo data upload
* 🐍 Python/Pandas data cleaning pipeline
* 🗂️ Upload history and processing status
* 👤 Mentor profile
* 📱 Responsive desktop and mobile interface
* 🔑 JWT-based protected API access

---

# 🏗️ Architecture

Dojo-Pulse follows a three-tier architecture:

```text
                         ┌──────────────────────┐
                         │      Mentor User     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │   Vite + Tailwind    │
                         └──────────┬───────────┘
                                    │
                              REST API / JWT
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Node.js + Express   │
                         │      Backend API     │
                         └───────┬───────┬──────┘
                                 │       │
                       MongoDB   │       │ Python Pipeline
                                 │       │
                                 ▼       ▼
                       ┌────────────┐  ┌─────────────────┐
                       │  MongoDB   │  │ Python + Pandas │
                       │  Database  │  │ Data Processor  │
                       └────────────┘  └─────────────────┘
```

---

# 📂 Project Structure

```text
Dojo-Pulse/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── BeltChart.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── StudentDetail.jsx
│   │   │   ├── Improvements.jsx
│   │   │   ├── DataUpload.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   └── services/
│   │       └── api.js
│   │
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── mentors.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── studentController.js
│   │   │   ├── analyticsController.js
│   │   │   └── uploadController.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Student.js
│   │   │   ├── DojoSlot.js
│   │   │   └── UploadHistory.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── uploadRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── analyticsService.js
│   │   │   └── pythonRunner.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   └── package.json
│
├── data_processor/
│   ├── cleaner.py
│   ├── run_pipeline.py
│   ├── requirements.txt
│   └── .venv/
│
├── .gitignore
├── package.json
└── README.md
```

---

# ⚙️ Technology Stack

| Layer            | Technology    |
| ---------------- | ------------- |
| Frontend         | React 18      |
| Build Tool       | Vite          |
| Styling          | Tailwind CSS  |
| Icons            | Lucide React  |
| HTTP Client      | Axios         |
| Routing          | React Router  |
| Backend          | Node.js       |
| API Framework    | Express.js    |
| Database         | MongoDB       |
| ODM              | Mongoose      |
| Authentication   | JWT           |
| File Upload      | Multer        |
| Data Processing  | Python        |
| Data Analysis    | Pandas        |
| Frontend Hosting | Vercel        |
| Backend Hosting  | Render        |
| Database Hosting | MongoDB Atlas |

---

# ✨ Features

## 🔐 Mentor Authentication

Dojo-Pulse provides restricted access for authorized mentors.

Authentication uses:

* Username/email login
* JWT session tokens
* Protected frontend routes
* Protected backend API routes
* Session verification
* Automatic logout for invalid/expired sessions

The application should never store production credentials inside the frontend or expose secrets through the README.

---

## 📊 Dashboard

The dashboard provides an overview of the current Dojo cohort.

### Dashboard metrics include

* Total students
* Improved students
* Students who have not improved
* Improvement rate
* Total belts earned
* Slots completed
* Active programming languages
* Recent student activity
* Language-wise progress

---

## 👨‍🎓 Student Tracking

Mentors can:

* View students
* Search students
* Open individual student details
* View belt progression
* View weekly/same-day progress
* Review language-wise attempts
* Track improvement status

---

## ⛩️ Belt Analytics

Dojo-Pulse tracks belt progression across supported programming languages.

Current base languages include:

```text
Python
Node.js
Java
C++
```

The analytics layer calculates:

* Belt advancement
* Attempts
* Improvement
* Belts earned
* Language-wise activity
* Historical progress

---

## 📈 Improvement Analytics

The Improvements section provides cohort-level analytics including:

* Improved students
* Students not improved
* Improvement percentage
* Total belts earned
* Language-wise belt progression
* Historical progress

Analytics are generated from persisted student records through the backend analytics service.

---

## 📁 Data Upload

Mentors can upload Dojo assessment data.

Supported formats:

```text
.csv
.xlsx
.xls
```

Maximum upload size:

```text
25 MB
```

The processing flow is:

```text
Upload File
     ↓
Multer Validation
     ↓
Upload History Record
     ↓
Python/Pandas Pipeline
     ↓
Data Cleaning
     ↓
Student Records Updated
     ↓
Analytics Recalculated
     ↓
Dashboard Updated
```

Failed processing attempts are recorded in upload history so that errors can be investigated.

---

# 🔌 API Overview

The frontend communicates with the backend through REST APIs.

### Authentication

```text
POST /api/auth/login
GET  /api/auth/profile
GET  /api/auth/roster
```

### Dashboard

```text
GET /api/dashboard/stats
```

### Students

```text
GET /api/students
GET /api/students/:id
```

### Analytics

```text
GET /api/analytics/improvements
```

### Uploads

```text
POST /api/uploads
GET  /api/uploads/history
```

### Health Check

```text
GET /api/health
```

Protected endpoints require:

```text
Authorization: Bearer <JWT>
```

---

# 🛠️ Local Development

## Prerequisites

Install:

* Node.js 18+
* npm
* Python 3.10+
* MongoDB or MongoDB Atlas
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/jeevanandjaisankar-JD/Dojo-Pulse.git
cd Dojo-Pulse
```

---

## 2. Install Dependencies

Install root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
npm install --prefix backend
```

Install frontend dependencies:

```bash
npm install --prefix frontend
```

Install Python dependencies:

```bash
cd data_processor
pip install -r requirements.txt
cd ..
```

---

# 🔑 Environment Variables

Create the required environment files locally.

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/dojo_pulse

JWT_SECRET=replace-with-a-long-random-secret

CLIENT_ORIGIN=http://localhost:3000

PYTHON_CMD=python
```

### Important

Never commit:

```text
.env
.env.local
.env.production
```

to GitHub.

Production secrets must be configured through the hosting provider's environment-variable system.

---

# ▶️ Running the Application

## Run frontend and backend together

From the project root:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

Backend health check:

```text
http://localhost:5000/api/health
```

---

## Run Services Individually

### Backend

```bash
npm run dev:backend
```

### Frontend

```bash
npm run dev:frontend
```

---

# 🧪 Testing & Verification

Before promoting changes to production, verify the following.

### Authentication

* [ ] Valid mentor can log in
* [ ] Invalid credentials are rejected
* [ ] Protected pages redirect unauthenticated users
* [ ] Refreshing the page preserves a valid session
* [ ] Invalid/expired sessions are cleared

### Dashboard

* [ ] Dashboard loads successfully
* [ ] KPI values are displayed
* [ ] Language statistics load
* [ ] Recent activity loads
* [ ] Empty database state does not crash the application

### Students

* [ ] Student list loads
* [ ] Student search works
* [ ] Student detail page loads
* [ ] Invalid student IDs are handled correctly

### Analytics

* [ ] Improvement analytics load
* [ ] Belt statistics are displayed
* [ ] Empty analytics state does not crash the UI

### Upload

* [ ] CSV upload works
* [ ] XLS/XLSX upload works
* [ ] Invalid file types are rejected
* [ ] Files above the size limit are rejected
* [ ] Pandas processing succeeds
* [ ] Failed processing is reported correctly
* [ ] Student records update after successful processing
* [ ] Upload history is recorded

### Responsive UI

* [ ] Desktop layout works
* [ ] Tablet layout works
* [ ] Mobile navigation works
* [ ] Pages do not overflow horizontally
* [ ] All routes work after browser refresh

---

# 🏗️ Build Verification

Before creating a production release:

```bash
npm run build:frontend
```

The frontend must build successfully without errors.

For backend verification:

```bash
npm run check --prefix backend
```

---

# 🚀 Deployment Architecture

The intended deployment structure is:

```text
                    GitHub
                      │
              ┌───────┴────────┐
              │                │
           deploy             main
          (staging)         (production)
              │                │
              ▼                ▼
          Staging            Production
          Testing             Release
```

### Frontend

Hosted through:

```text
Vercel
```

### Backend

Hosted through:

```text
Render
```

### Database

Hosted through:

```text
MongoDB Atlas
```

---

# 🌱 Git Branching Strategy

Dojo-Pulse uses a staging-based workflow.

```text
feature branch
      │
      ▼
 Pull Request
      │
      ▼
   deploy
      │
      ▼
 Testing / Fixes
      │
      ▼
 Pull Request
      │
      ▼
    main
      │
      ▼
 Production
```

## `main`

`main` represents the production version.

Rules:

* No direct feature development
* No direct pushes
* Changes enter through an approved PR
* Production should only contain tested code

---

## `deploy`

`deploy` represents the staging/integration environment.

Rules:

* Feature branches target `deploy`
* PR review is required
* Integration testing happens here
* Bugs are fixed before production promotion
* The branch can be deployed as a staging environment

---

## Feature Branches

Use descriptive branch names.

Examples:

```text
feat/student-search
feat/dashboard-analytics
fix/upload-error
fix/mobile-navigation
refactor/authentication
docs/project-readme
chore/dependency-cleanup
```

---

# 🔀 Pull Request Workflow

Every contributor should follow:

```text
1. Pull latest deploy
       ↓
2. Create feature branch
       ↓
3. Implement changes
       ↓
4. Test locally
       ↓
5. Push branch
       ↓
6. Create PR → deploy
       ↓
7. Review
       ↓
8. Fix review comments
       ↓
9. Merge into deploy
       ↓
10. Staging testing
       ↓
11. PR deploy → main
       ↓
12. Production release
```

Before starting new work:

```bash
git checkout deploy
git pull origin deploy
```

---

# 🔒 Security Guidelines

Do not commit:

```text
.env
.env.production
JWT secrets
MongoDB credentials
API keys
Passwords
Private tokens
Personal credentials
```

Production secrets must be stored in the deployment platform's environment variables.

Authentication credentials should not be documented in this README.

For future security improvements, the authentication system should use securely hashed passwords and a persistent user/mentor store rather than plaintext credentials inside source code.

---

# 🗄️ Database Strategy

Development, staging, and production should use separate database environments.

Recommended structure:

```text
Development
    ↓
Local MongoDB

Staging
    ↓
MongoDB Atlas
    ↓
Separate staging database

Production
    ↓
MongoDB Atlas
    ↓
Separate production database
```

This prevents staging uploads and testing operations from modifying production student data.

---

# 🐍 Data Processing Pipeline

The Python layer is responsible for cleaning and transforming uploaded Dojo data.

```text
Raw Dojo File
      ↓
run_pipeline.py
      ↓
cleaner.py
      ↓
Normalized Student Data
      ↓
Node.js Backend
      ↓
MongoDB
```

The backend invokes the Python pipeline through `pythonRunner.js`.

---

# 📈 Analytics Flow

Analytics are generated from persisted student records.

```text
MongoDB Student Records
          ↓
   analyticsService
          ↓
 ┌────────┴─────────┐
 │                  │
Dashboard        Improvements
 │                  │
 └────────┬─────────┘
          ▼
      Mentor UI
```

Keeping the analytics calculations centralized helps ensure that the Dashboard and Improvements pages use the same underlying calculations.

---

# 🩺 Health Check

The backend provides:

```text
GET /api/health
```

A successful response indicates that the API process is running.

Example response:

```json
{
  "success": true,
  "service": "dojo-pulse-api"
}
```

---

# 📋 Current Project Status

### Phase 1 — Prototype

* [x] Full-stack application structure
* [x] Mentor authentication
* [x] Dashboard
* [x] Student tracking
* [x] Student detail view
* [x] Improvement analytics
* [x] Data upload
* [x] Python/Pandas processing
* [x] MongoDB integration
* [x] Responsive UI
* [x] GitHub PR workflow

### Phase 2 — Stabilization & Security

* [ ] Dedicated staging deployment
* [ ] Separate staging database
* [ ] Production/staging environment separation
* [ ] Authentication security improvements
* [ ] Secret management cleanup
* [ ] Additional validation
* [ ] UI refinement
* [ ] Comprehensive staging testing
* [ ] Production release hardening

---

# 👥 Development Team

Dojo-Pulse is developed as a collaborative student software project.

The team follows a pull-request-based development workflow where changes are reviewed and integrated through the staging branch before production.

---

# 📄 License

This project is currently maintained as an academic/student software project.

License:

```text
MIT
```

---

# ⛩️ Dojo-Pulse

**Track student progress.
Understand improvement.
Turn Dojo data into actionable insight.**
