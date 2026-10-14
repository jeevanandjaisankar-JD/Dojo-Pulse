# Dojo-Pulse

> **Kalvium Dojo Mentor Progress Tracking & Analytics Platform**

Dojo-Pulse is a full-stack web application designed to help mentors monitor, analyze, and manage student progress in the Kalvium Dojo evaluation system.

The platform provides a centralized mentor portal for viewing student performance, tracking belt progression, analyzing improvement patterns, and uploading Dojo evaluation data.

---

## 📌 Project Overview

Dojo-Pulse brings student Dojo performance data into a single mentor-focused dashboard.

Instead of manually reviewing large amounts of evaluation data, mentors can use the platform to:

* Monitor overall student progress
* View individual student performance
* Track belt progression
* Analyze improvement trends
* Identify students requiring attention
* Upload Dojo evaluation data through CSV files
* Review previous uploads
* Delete upload history and stored source files when required
* Access the platform through authenticated mentor accounts

The project is built as a full-stack application with a React frontend, Node.js/Express backend, MongoDB database, and cloud deployment.

---

## 🎯 Core Objectives

* Provide mentors with a centralized student progress dashboard.
* Make Dojo evaluation data easier to understand and analyze.
* Track belt progression and improvement over time.
* Reduce manual data-processing effort.
* Provide secure mentor-only access.
* Maintain a structured upload history.
* Establish a development → staging → production workflow for the team.

---

## ✨ Features

### 🔐 Mentor Authentication

* Mentor-only login system.
* Username or email based authentication.
* JWT-based session authentication.
* Protected application routes.
* Centralized authentication service.
* Automatic authentication token handling for API requests.
* Session verification when the application starts.
* Dedicated logout functionality.
* Redirect unauthenticated users to the login page.
* Password visibility Show/Hide option on the login page.

### 📊 Dashboard

The dashboard provides an overview of student progress and Dojo performance.

It includes:

* Total student count
* Belt-related statistics
* Improvement statistics
* Progress analytics
* Performance summaries
* Visual data representation

### 👨‍🎓 Student Management

Mentors can:

* View the student roster.
* Search and inspect student information.
* Open individual student profiles.
* Review belt progression.
* View attempts and evaluation history.
* Review languages attempted.
* Track improvement status.

### 📈 Student Analytics

The application tracks:

* Verified belts
* Current belt level
* Total belts earned
* Slots attempted
* Improvement status
* Languages attempted
* Same-day progress
* Individual slot attempts
* Belt progression over time

### 📉 Improvements Analytics

The Improvements section provides mentor-oriented analysis of student improvement patterns.

It helps mentors identify:

* Students who improved
* Students with no improvement
* Improvement rates
* Belt progression patterns
* Language-related performance data

### 📤 Dojo Data Upload

Mentors can upload Dojo evaluation data through the Data Upload page.

Current frontend upload flow:

* CSV file selection
* Drag-and-drop upload
* File validation
* Upload progress state
* Success/error feedback
* Upload history
* Record count information
* Upload status tracking

The backend upload middleware currently supports CSV and Excel file extensions, while the current frontend upload interface is configured for `.csv` files.

### 🗂️ Upload History

Every processed upload can be displayed in the upload history section.

The history contains information such as:

* File name
* Upload date
* Number of processed records
* Processing status
* Upload action controls

### 🗑️ Upload History Deletion

Upload history entries can be deleted individually.

The deletion workflow:

1. Mentor clicks **Delete**.
2. A confirmation warning is displayed.
3. The stored upload history record is deleted.
4. The associated stored source file is deleted.
5. The deleted row is immediately removed from the UI.
6. Success/error feedback is displayed.
7. A per-row loading state prevents duplicate deletion requests.

> **Important:** Deleting an upload history entry does **not** delete the already-processed student records.

### 👤 Mentor Profile

The Profile page provides mentor information and includes:

* Mentor details
* Mentor role information
* Profile information returned by the backend
* Logout functionality

### 🎨 Frontend Branding

The frontend includes dedicated project branding assets:

* Kalvium logo
* Dojo upload/dropzone logo

The Kalvium logo is used in the main navigation and login experience, while the Dojo upload logo is used in the data-upload interface.

---

## 🏗️ Technology Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* JWT
* Multer

### Database

* MongoDB
* Mongoose

### Data Processing

* Python
* Pandas

### Deployment

* Vercel — Frontend
* Render — Backend
* MongoDB — Database

---

## 📁 Project Structure

```text
Dojo-Pulse/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── mentors.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── studentController.js
│   │   │   └── uploadController.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Student.js
│   │   │   └── UploadHistory.js
│   │   │
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   └── uploadRoutes.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   ├── package.json
│   └── ...
│
├── data_processor/
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── kalvium-logo.svg
│   │   │   └── dojo-upload-logo.svg
│   │   │
│   │   ├── components/
│   │   │   ├── BeltChart.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── MentorBanner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DataUpload.jsx
│   │   │   ├── Improvements.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── StudentDetail.jsx
│   │   │   └── Students.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## 🔑 Authentication Architecture

Authentication is separated into dedicated layers.

### `authService.js`

The frontend authentication service is responsible for:

* Reading the stored JWT.
* Storing the JWT.
* Checking authentication state.
* Removing the JWT during logout.

### `AuthContext.jsx`

The authentication context manages application-level authentication state.

It handles:

* Current mentor
* Authentication token
* Login
* Logout
* Session verification
* Authentication loading state

### `ProtectedRoute.jsx`

Protected routes prevent unauthenticated access to the main application.

The flow is:

```text
User
 │
 ▼
Login
 │
 ▼
Backend Authentication
 │
 ├── Failed → Error
 │
 └── Success
       │
       ▼
      JWT
       │
       ▼
AuthContext
       │
       ▼
Protected Routes
       │
       ▼
Dojo-Pulse Dashboard
```

---

## 🔌 API Structure

The backend exposes the following major API groups:

```text
/api/auth
/api/dashboard
/api/students
/api/analytics
/api/uploads
```

### Authentication

```text
POST /api/auth/login
GET  /api/auth/profile
GET  /api/auth/roster
```

### Dashboard

```text
/api/dashboard/*
```

### Students

```text
/api/students/*
```

### Analytics

```text
/api/analytics/*
```

### Uploads

```text
POST   /api/uploads
GET    /api/uploads/history
DELETE /api/uploads/history/:id
```

### Health Check

```text
GET /api/health
```

Expected response:

```json
{
  "success": true,
  "service": "dojo-pulse-api"
}
```

---

## 🔄 Upload Processing Flow

```text
Mentor
  │
  ▼
Select / Drop CSV
  │
  ▼
Frontend Validation
  │
  ▼
POST /api/uploads
  │
  ▼
Multer File Handling
  │
  ▼
Data Processing
  │
  ▼
MongoDB
  │
  ├── Student Data
  │
  └── Upload History
  │
  ▼
Analytics
  │
  ▼
Dashboard / Student / Improvements
```

---

## 🗑️ Upload Deletion Flow

```text
Mentor clicks Delete
        │
        ▼
Confirmation Dialog
        │
        ▼
DELETE /api/uploads/history/:id
        │
        ├───────────────┐
        ▼               ▼
Delete history      Delete stored file
record
        │               │
        └───────┬───────┘
                ▼
       Remove row from UI
                │
                ▼
       Show success message
```

Processed `Student` documents remain unchanged.

---

## 💾 Database Models

### Student

Student records contain:

* Student ID
* Email
* Name
* Batch
* Mentor
* Verified belts
* Current belt level
* Total belts earned
* Total slots attempted
* Improvement status
* Languages attempted
* Same-day progress
* Slot attempts
* Timestamps

### UploadHistory

Upload records contain:

* File name
* Original file name
* File size
* Stored file path
* MIME type
* Slot number
* Uploading mentor
* Processing status
* Rows processed
* Processing summary
* Error information
* Creation/update timestamps

---

## 🛡️ Security

The application uses:

* JWT authentication
* Protected backend routes
* Protected frontend routes
* Authorization headers
* Environment variables for sensitive deployment configuration
* File type validation
* File size limits
* Restricted mentor access
* Centralized authentication/session handling

### Important Security Requirement

Development mentor credentials currently exist in backend configuration and are intended for the current prototype/development workflow.

Before a production-grade release:

* Replace temporary credentials.
* Do not commit production passwords.
* Use secure secret management.
* Rotate JWT secrets.
* Review authentication and authorization.
* Review CORS configuration.
* Review uploaded-file handling.
* Audit sensitive configuration before deployment.

---

## ⚙️ Environment Variables

### Backend

The backend requires environment configuration similar to:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_ORIGIN=http://localhost:3000
```

Additional deployment-specific variables may be required depending on the data-processing configuration.

> Never commit `.env` files, database credentials, JWT secrets, or other sensitive configuration to Git.

---

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/jeevanandjaisankar-JD/Dojo-Pulse.git
cd Dojo-Pulse
```

### 2. Install dependencies

From the project root:

```bash
npm run install:all
```

### 3. Configure backend environment

Create:

```text
backend/.env
```

and configure the required environment variables.

### 4. Start the complete application

From the project root:

```bash
npm run dev
```

This starts:

```text
Frontend → http://localhost:3000
Backend  → http://localhost:5000
```

The Vite development server proxies `/api` requests to the backend.

---

## 🧪 Development Commands

### Run frontend

```bash
npm run dev:frontend
```

### Run backend

```bash
npm run dev:backend
```

### Run both

```bash
npm run dev
```

### Build frontend

```bash
npm run build:frontend
```

---

## 🌐 Deployment

### Frontend

The frontend is deployed through Vercel.

Production frontend:

```text
https://dojo-pulse.vercel.app/
```

### Backend

The backend is deployed through Render.

Production backend:

```text
https://dojo-pulse.onrender.com/
```

### Architecture

```text
                 ┌──────────────────┐
                 │      Mentor      │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │     Vercel       │
                 │ React + Vite     │
                 └────────┬─────────┘
                          │
                       /api
                          │
                          ▼
                 ┌──────────────────┐
                 │      Render      │
                 │ Node + Express   │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │     MongoDB      │
                 │ Student Data     │
                 │ Upload History   │
                 └──────────────────┘
```

---

## 🌱 Git Branching Strategy

Dojo-Pulse follows a staging-based Git workflow.

### `main`

Production branch.

Purpose:

* Stable production code
* TL-controlled
* Only tested changes should reach this branch
* No direct contributor development

### `deploy`

Integration and staging branch.

Purpose:

* Team integration
* Feature testing
* Conflict resolution
* Staging deployment
* Pre-production validation

### Feature branches

Team members create dedicated branches for individual tasks.

Example:

```text
feature/student-analytics
fix/upload-history
feat/password-visibility
chore/update-readme
```

---

## 🔀 Pull Request Workflow

```text
Feature Branch
      │
      ▼
   PR → deploy
      │
      ▼
TL Review
      │
      ▼
Testing on deploy
      │
      ▼
Staging Validation
      │
      ▼
PR → main
      │
      ▼
Production
```

### Rules

* Contributors should create feature branches.
* Feature branches should target `deploy`.
* PRs should be reviewed before merging.
* Changes should be tested on `deploy`.
* `main` should only receive validated changes.
* Production changes should be promoted from `deploy` to `main`.

---

## 📋 Current Frontend Improvements

The current frontend includes the following completed improvements:

### Branding

* Kalvium logo added to Navbar.
* Kalvium logo added to Login page.
* Login logo alignment adjusted for the existing layout.
* Dojo upload logo added to the Data Upload dropzone.
* Dedicated SVG assets stored under `frontend/src/assets/`.

### Authentication

* Dedicated `authService.js`.
* Centralized JWT token retrieval.
* Centralized token storage/removal.
* AuthContext integration.
* Dedicated logout flow.
* Protected route handling.
* Login password visibility toggle.

### Upload Management

* Upload history display.
* Individual upload deletion.
* Delete confirmation.
* Per-row deletion loading state.
* Success/error messages.
* Stored upload file deletion.
* Upload history document deletion.
* Student records preserved after upload-history deletion.

---

## 📌 Project Status

### Phase 1 — Prototype

**Status: Completed**

The first functional prototype includes:

* Full-stack application structure
* Mentor authentication
* Dashboard
* Student management
* Student detail view
* Improvement analytics
* Dojo data upload
* Upload history
* Upload history deletion
* Mentor profile
* Protected routes
* Initial cloud deployment
* GitHub collaboration workflow
* Production/staging branch structure
* Initial frontend branding

### Phase 2 — Planned / Ongoing

Planned improvements include:

* Staging branch deployment
* UI refinement
* Additional UX improvements
* Security hardening
* Production credential management
* Authentication improvements
* Deployment reliability improvements
* Further analytics enhancements
* Additional testing
* Production readiness review

---

## 🧭 Future Improvements

Potential future improvements include:

* Role-based access control
* More granular mentor permissions
* Secure database-backed mentor accounts
* Password reset functionality
* Better session expiration handling
* Automated testing
* Better upload validation and processing feedback
* Advanced student analytics
* More detailed mentor reports
* Improved error monitoring
* CI/CD automation
* Separate staging and production databases
* Stronger production security controls

---

## 👥 Team Workflow

Dojo-Pulse is developed collaboratively by a student team with a TL-controlled integration and production workflow.

Development responsibilities are organized through:

* GitHub Issues
* Feature branches
* Pull Requests
* Code reviews
* `deploy` staging integration
* `main` production release

---

## 📄 License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.

---

## 🔗 Project Links

### Repository

https://github.com/jeevanandjaisankar-JD/Dojo-Pulse

### Frontend

https://dojo-pulse.vercel.app/

### Backend

https://dojo-pulse.onrender.com/

---

## 🏁 Dojo-Pulse

**A centralized mentor platform for tracking, analyzing, and improving student Dojo progress.**
