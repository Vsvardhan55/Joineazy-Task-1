# Joineazy – Student, Group & Assignment Management System

A role-based full-stack web application for managing students, groups, assignments, and submission confirmations.

## 🚀 Overview

Joineazy is a full-stack Student, Group & Assignment Management System developed as part of the **Joineazy Full Stack Intern – Task 1**.

The application provides separate workflows for:

* **Students** – manage groups, view assignments, access assignment resources, and confirm submissions.
* **Admins/Professors** – create and manage assignments, assign work to students/groups, and track submission progress.

The project follows a modular architecture with secure JWT authentication, REST APIs, PostgreSQL persistence, and a responsive React interface.

---

## ✨ Features

### 👨‍🎓 Student

* Student registration and login
* JWT-based authentication
* Create and manage groups
* Add group members using email or student ID
* View group information
* View assigned assignments
* Access OneDrive assignment links
* Two-step assignment submission confirmation
* Visual assignment progress tracking
* Protected student routes

### 👨‍🏫 Admin / Professor

* Admin login
* JWT-based role-based authorization
* Create assignments
* Edit assignments
* View assignments
* Set:

  * Assignment title
  * Description
  * Due date
  * OneDrive resource link
* Assign assignments to students/groups
* Track student submission confirmations
* View pending and confirmed submissions
* Monitor group progress
* Dashboard-based progress tracking
* Basic analytics

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Tailwind CSS
* HTML5
* JavaScript
* Vite

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* bcryptjs

### Database

* PostgreSQL
* Neon PostgreSQL

### DevOps

* Docker
* Docker Compose
* Nginx

---

## 🏗️ Project Architecture

```text
Joineazy-Task-1/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── groupController.js
│   │   │   ├── assignmentController.js
│   │   │   └── submissionController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── groupRoutes.js
│   │   │   ├── assignmentRoutes.js
│   │   │   └── submissionRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🔐 Authentication & Authorization

The application uses **JWT-based authentication**.

### Authentication flow

```text
User
  │
  ▼
Register / Login
  │
  ▼
Backend Authentication
  │
  ├── Validate credentials
  ├── Hash/compare password
  └── Generate JWT
  │
  ▼
Frontend stores authentication state
  │
  ▼
JWT sent with protected API requests
  │
  ▼
Auth Middleware
  │
  ├── Student
  └── Admin
```

Role-based middleware prevents users from accessing functionality outside their assigned role.

---

## 🗄️ Database Relationships

The PostgreSQL database manages the relationships between users, groups, assignments, and submissions.

Conceptually:

```text
Users
  │
  ├──────────────┐
  │              │
  ▼              ▼
Groups       Assignments
  │              │
  │              │
  └──────┬───────┘
         ▼
    Submissions
```

### Main entities

| Entity      | Purpose                                         |
| ----------- | ----------------------------------------------- |
| Users       | Stores student/admin account information        |
| Groups      | Stores student group information                |
| Assignments | Stores assignment details and resources         |
| Submissions | Stores student submission confirmation/progress |

The application uses relational database relationships to associate students with groups and assignments with submission tracking.

---

## 🔌 API Structure

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Groups

```text
POST /api/groups
GET  /api/groups
POST /api/groups/:groupId/members
```

### Assignments

```text
GET  /api/assignments
POST /api/assignments
PUT  /api/assignments/:id
```

### Submissions

```text
GET  /api/submissions
POST /api/submissions
```

Protected endpoints require a valid JWT token.

---

## 🐳 Running with Docker

### Prerequisites

Install:

* Docker Desktop
* Git

### 1. Clone the repository

```bash
git clone https://github.com/Vsvardhan55/Joineazy-Task-1.git
cd Joineazy-Task-1
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

Create the frontend environment file:

```text
frontend/.env
```

with:

```env
VITE_API_URL=http://localhost:5000/api
```

**Do not commit `.env` files or database credentials to GitHub.**

### 3. Start the application

```bash
docker compose up -d --build
```

### 4. Access the application

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

Backend health check:

```text
http://localhost:5000/api/health
```

### 5. Stop the application

```bash
docker compose down
```

---

## 💻 Running Without Docker

### Backend

```bash
cd backend
npm install
npm start
```

Development mode:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Application Workflow

### Student workflow

```text
Register / Login
       ↓
Student Dashboard
       ↓
Create / Join Group
       ↓
Manage Group Members
       ↓
View Assignments
       ↓
Open OneDrive Resource
       ↓
Confirm "Yes, I have submitted"
       ↓
Final Confirmation
       ↓
Progress Updated
```

### Admin workflow

```text
Admin Login
     ↓
Admin Dashboard
     ↓
Create Assignment
     ↓
Set Assignment Details
     ↓
Assign to Students / Groups
     ↓
Monitor Confirmations
     ↓
View Progress & Analytics
```

---

## 🎯 Design Decisions

### Modular Backend

Backend responsibilities are separated into:

* Routes
* Controllers
* Middleware
* Database configuration

This improves maintainability and makes individual modules easier to understand and extend.

### Service-Based Frontend

API communication is separated into dedicated service files for:

* Authentication
* Groups
* Assignments
* Submissions

This keeps UI components focused on presentation and user interaction.

### JWT Authentication

JWT provides stateless authentication for protected API requests and supports role-based access control.

### PostgreSQL

PostgreSQL was selected because the application contains relational entities such as users, groups, assignments, and submissions.

### Docker

Docker and Docker Compose provide a consistent development and deployment environment for the frontend and backend.

---

## 📱 Responsive UI

The frontend is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile-sized screens

The interface provides dedicated dashboards and protected routes based on the authenticated user's role.

---

## 🔒 Security Considerations

* Passwords are hashed using bcrypt
* JWT is used for authentication
* Protected API routes require authentication
* Role-based authorization is implemented
* Environment variables are used for sensitive configuration
* Database credentials are excluded from Git tracking

---

## 📌 Project Status

### Completed

* [x] Student authentication
* [x] Admin authentication
* [x] JWT authorization
* [x] Group management
* [x] Assignment management
* [x] Assignment resource links
* [x] Submission confirmation
* [x] Progress tracking
* [x] Admin tracking dashboard
* [x] PostgreSQL integration
* [x] Docker configuration
* [x] Responsive React frontend

---

## 👨‍💻 Developer

**Sethu Vardhan Valluri**

B.Tech – Electronics & Communication Engineering

GitHub:
https://github.com/Vsvardhan55

LinkedIn:
https://www.linkedin.com/in/sethu-vardhan-valluri/

---

## 📄 Assignment

**Joineazy – Full Stack Intern Technical Task**

**Task 1:** Student, Group & Assignment Management System

Built using React.js, Tailwind CSS, Node.js, Express.js, PostgreSQL, JWT, Docker, and HTML.

---

## 📜 License

This project was developed for the Joineazy Full Stack Intern technical assessment.
