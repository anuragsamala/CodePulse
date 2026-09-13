# CodePulse — Full-Stack DSA Learning & Progress Platform

A production-ready full-stack DSA learning and progress tracking platform built with **React**, **Node.js/Express**, **PostgreSQL**, and **Prisma ORM**.

---

## 🌟 Core Architecture & Ecosystem

CodePulse marries two central paradigms:
1. **Personal DSA Progress Tracking:** Every student possesses completely isolated, private progress records (NOT_STARTED, IN_PROGRESS, SOLVED), study notes, streak counters, daily targets, and GitHub-style 365-day contribution heatmaps.
2. **Shared DSA Question & Solution Community:** Questions and solutions across C++, Java, Python, JavaScript, C, and Go are globally discoverable to authenticated members, supporting multi-solution comparisons, syntax-highlighted Monaco editors, file uploads, and community discussions.

### 🛡️ Critical Independence Demonstration
`	ext
Rahul creates "Two Sum"
        ↓
Question becomes publicly visible in Explore Bank
        ↓
Rahul submits C++ solution & marks as SOLVED
        ↓
Priya sees Rahul's question and C++ solution
        ↓
Priya submits Python solution & marks as SOLVED
        ↓
Akhil views the question and sees both C++ and Python solutions
        ↓
Akhil's personal status remains NOT_STARTED
`

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v7, Axios, Recharts, Lucide React, Monaco Editor (@monaco-editor/react).
- **Backend:** Node.js, Express.js, JWT Authentication (HTTP-only cookies + Bearer tokens), bcryptjs, Helmet, CORS, Rate Limiting, Multer file upload engine.
- **Database & ORM:** PostgreSQL, Prisma ORM with composite unique constraints ([studentId, questionId]) and indexing.

---

## 📁 Project Structure

`	ext
CodePulse/
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext with persistent session
│   │   ├── layouts/         # DashboardLayout (Sidebar, TopNav, Mobile drawer)
│   │   ├── pages/           # Dashboard, Explore, Details, Create, Analytics, etc.
│   │   ├── services/        # Axios API client
│   │   └── App.jsx          # Protected routes & role-based guards
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── controllers/         # Auth, Question, Solution, Comment, Progress, Student, Admin
│   ├── routes/              # Express REST endpoints
│   ├── middleware/          # JWT auth, role authorization, multer, error handler
│   ├── services/            # Storage interface, Activity logging, Streak engine
│   ├── prisma/
│   │   ├── schema.prisma    # PostgreSQL relational schema
│   │   └── seed.js          # Seed dataset: 1 Admin, 2 Mentors, 8 Students, 30 Questions
│   ├── uploads/             # Code solution uploads
│   └── server.js            # Express application entry
│
├── .env.example
├── README.md
└── package.json             # Root orchestration
`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running locally on port 5432

### 2. Environment Configuration
Copy .env.example to .env in both root and server/:
`ash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codepulse?schema=public"
PORT=5000
JWT_SECRET="codepulse_super_secret_jwt_key_2026_dsa_platform"
CLIENT_URL="http://localhost:5173"
UPLOAD_DIR="./uploads"
`

### 3. Database Migration & Seeding
`ash
cd server
npm install
npx prisma db push
node prisma/seed.js
`

### 4. Running Development Servers
From the root directory:
`ash
npm run server    # Runs Express API on http://localhost:5000
npm run client    # Runs Vite Frontend on http://localhost:5173
`

Or run both concurrently:
`ash
npm run dev
`

---

## 🧪 Demo Credentials

All accounts are pre-seeded with password: password123

| Name | Role | Email | Purpose |
|---|---|---|---|
| **System Admin** | ADMIN | dmin@codepulse.dev | User management & platform analytics |
| **Dr. Vikramaditya** | MENTOR | ikram@codepulse.dev | Cohort tracking, question assignments |
| **Rahul Sharma** | STUDENT | ahul@student.codepulse.dev | Two Sum author (C++ solution, SOLVED) |
| **Priya Patel** | STUDENT | priya@student.codepulse.dev | Two Sum solver (Python solution, SOLVED) |
| **Akhil Kumar** | STUDENT | khil@student.codepulse.dev | Two Sum observer (NOT_STARTED) |
| **Sneha Reddy** | STUDENT | sneha@student.codepulse.dev | Student solver & contributor |

---

## 🧪 Automated Critical Scenario Verification

Run the verification test script:
`ash
node server/scripts/test-flow.js
`
This script automatically executes the mandatory verification scenario ensuring that Rahul, Priya, and Akhil interact with the exact same question and community solutions without any progress leakage.