# Joineazy – Student, Group & Assignment Management System

A full-stack, role-based web application for managing students, groups, assignments, submission acknowledgements, and progress tracking.

Built as part of the **Joineazy Full Stack Intern Technical Assessment – Round 2 / Task 2**.

---

## 🚀 Overview

Joineazy is a full-stack Student, Group & Assignment Management System designed to simplify assignment management, group collaboration, submission acknowledgement, and progress tracking.

The application provides separate workflows for students and professors/administrators.

### 👨‍🎓 Student Workflow

Students can:

- Register and log in securely
- Access a personalized student dashboard
- Create and manage groups
- Add group members using email or student ID
- View group members and group leader information
- View assignments assigned to their groups
- Open assignment resources through OneDrive
- View assignment descriptions and deadlines
- View individual or group submission type
- Confirm assignment submission
- View submission acknowledgement status
- Track group submission progress
- Access protected student routes

### 👨‍🏫 Professor / Administrator Workflow

Professors can:

- Log in using role-based authentication
- Access a dedicated professor dashboard
- Create assignments
- Edit assignments
- Delete assignments
- Configure assignment submission type
- Assign assignments to groups
- Add descriptions and deadlines
- Add OneDrive assignment resources
- Track student submission confirmations
- View pending and confirmed submissions
- Monitor group progress
- View assignment-level analytics
- View overall submission progress

---

# 🎯 Task 2 Objective

Task 2 builds on the functional Task 1 prototype and focuses on:

- UI/UX improvements
- Responsive frontend design
- Better navigation and information hierarchy
- Improved form interactions
- Better loading and error states
- Assignment submission workflows
- Group acknowledgement logic
- Submission progress tracking
- Professor analytics
- Improved backend validation
- PostgreSQL relationship handling
- Production-ready frontend build

The goal was to make the application more intuitive, responsive, maintainable, and closer to a real-world student assignment management platform.

---

# ✨ Key Features

## 🔐 Authentication

- Student registration
- Student login
- Professor/Admin login
- JWT authentication
- Password hashing using bcryptjs
- Protected frontend routes
- Protected backend API routes
- Role-based authorization
- Automatic authentication verification
- Logout functionality
- Form validation
- Loading and error feedback

## 👨‍🎓 Student Features

- Student dashboard
- Group management
- Group creation
- Group member management
- Group leader identification
- Assignment listing
- Assignment details
- Assignment deadline display
- Submission type display
- OneDrive assignment resource access
- Submission acknowledgement
- Group progress tracking
- Confirmation status indicators

## 👨‍🏫 Professor Features

- Professor dashboard
- Assignment creation
- Assignment editing
- Assignment deletion
- Assignment-to-group assignment
- Submission type configuration
- OneDrive resource configuration
- Submission tracking
- Student confirmation tracking
- Pending/confirmed status
- Assignment progress
- Overall analytics

## 🎨 UI/UX Features

- Responsive layouts
- Mobile-friendly interface
- Tablet-friendly interface
- Desktop layouts
- Consistent navigation
- Modern dashboard cards
- Responsive assignment cards
- Status badges
- Progress bars
- Loading indicators
- Error messages
- Success messages
- Empty states
- Confirmation dialogs
- Hover effects
- Smooth transitions
- Consistent form controls
- Improved visual hierarchy

---

# 🎨 Task 2 UI/UX Improvements

The original functional prototype was enhanced with a consistent visual design system.

## 🧭 Navigation

The application uses clear navigation bars for each role.

### Student navigation

Student navigation provides access to:

- Student Dashboard
- Group Management
- Logout

### Professor navigation

Professor navigation provides access to:

- Professor Dashboard
- User/Role information
- Logout

Navigation elements are designed to remain clear across different screen sizes.

---

# 📊 Dashboard Design

Dashboard information is presented using responsive cards.

Important metrics are visually separated to make the interface easier to scan.

## Student Dashboard Information

- Group count
- Assignment count
- Student ID
- Current group
- Group progress
- Assignment status
- Assignment deadlines

## Professor Dashboard Information

- Total assignments
- Total students
- Confirmed submissions
- Pending submissions
- Overall progress

---

# 📊 Student Dashboard

The Student Dashboard provides a centralized workspace for students.

The dashboard displays:

- Student identity
- Student ID
- Group information
- Number of groups
- Number of assignments
- Current group progress
- Assigned assignments

Each assignment card provides information such as:

- Assignment title
- Submission status
- Submission type
- Group name
- Due date
- Group progress
- OneDrive resource
- Assignment details link

Assignments can be opened directly from the dashboard.

---

# 👥 Group Management

Students can create and manage groups.

## Group Functionality

- Create a new group
- View existing groups
- Select a group
- View group details
- View group leader
- View group members
- Add members using email
- Add members using student ID
- Remove group members
- Identify the current user
- Identify the group leader
- Display permission information

Only authorized group users can perform restricted group operations.

---

# 📝 Assignment Management

Professors can manage assignments from the Professor Dashboard.

Each assignment can contain:

- Title
- Description
- Due date
- Submission type
- OneDrive resource link
- Assigned groups

## Supported Submission Types

```text
GROUP
INDIVIDUAL
```

### Professors can:

- Create assignments
- Edit assignments
- Delete assignments
- Assign assignments to groups
- View assignment information
- Monitor submission progress

---

# 📄 Assignment Details

Students can open an assignment to view detailed information.

The Assignment Details page displays:

- Assignment title
- Description
- Due date
- Submission type
- Assigned group
- OneDrive resource
- Submission acknowledgement
- Current submission status
- Group submission progress

The page uses a responsive layout with clear sections for assignment information, submission acknowledgement, and progress.

---

# ✅ Submission Acknowledgement

The application supports both individual and group submission acknowledgement.

## Group Submission

For group assignments:

1. The student opens the assignment.
2. The student reviews the assignment details.
3. The group leader confirms the submission.
4. The backend validates the group and leader.
5. The acknowledgement is propagated to all group members.
6. Group progress is updated.
7. All members can see the updated acknowledgement status.

**Only the group leader can acknowledge a group submission.**

## Individual Submission

For individual assignments:

1. The student opens the assignment.
2. The student reviews the assignment information.
3. The student confirms their submission.
4. The backend records the confirmation for that student.
5. The student's submission status is updated independently.

---

# 📈 Progress Tracking

Submission progress is displayed visually.

Example progress states:

```text
0 of 3 members confirmed
0%
```

```text
1 of 3 members confirmed
33%
```

```text
2 of 3 members confirmed
67%
```

```text
3 of 3 members confirmed
100%
```

Progress information is displayed using:

- Progress bars
- Status badges
- Confirmation indicators
- Pending indicators
- Completion messages

This allows both students and professors to quickly understand submission progress.

---

# 👨‍🏫 Professor Dashboard

The Professor Dashboard provides an administrative workspace for assignment management and submission monitoring.

The dashboard includes analytics such as:

- Total Assignments
- Total Students
- Confirmed Submissions
- Pending Submissions
- Overall Progress

## Example Test State

| Metric | Value |
|---|---:|
| Total Assignments | 2 |
| Total Students | 3 |
| Confirmed Submissions | 4 |
| Pending Submissions | 2 |
| Overall Progress | 67% |

The values are calculated from the application's PostgreSQL data.

---

# 📋 Submission Tracking

Professors can monitor submission confirmations for assigned assignments.

Submission tracking includes:

- Assignment
- Group
- Student
- Student email
- Confirmation status
- Group progress

## Supported States

- **CONFIRMED**
- **PENDING**

This allows professors to quickly identify which students have acknowledged their assignments.

---

# 🔐 Authentication & Authorization

Joineazy uses JWT-based authentication.

## Authentication Flow

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
  ├── Hash / compare password
  └── Generate JWT
  │
  ▼
Frontend Authentication Context
  │
  ▼
JWT sent with protected API requests
  │
  ▼
Authentication Middleware
  │
  ├── STUDENT
  │
  └── ADMIN
```

---

# 🛡️ Role-Based Access

The application supports two main roles.

| Role | Access |
|---|---|
| `STUDENT` | Student Dashboard, Groups, Assignments, Submission Acknowledgement |
| `ADMIN` | Professor Dashboard, Assignment Management, Submission Tracking |

Frontend and backend route protection prevents users from accessing functionality outside their assigned role.

---

# 🗄️ Database

The application uses PostgreSQL for persistent storage.

The database is hosted using Neon PostgreSQL during development.

## Main Tables

### `users`

Stores user account information:

- User ID
- Name
- Email
- Password hash
- Student ID
- Role

### `groups`

Stores group information:

- Group ID
- Group name
- Group creator / leader

### `group_members`

Associates students with groups.

### `assignments`

Stores:

- Assignment ID
- Title
- Description
- Due date
- OneDrive link
- Submission type
- Assignment creator
- Creation timestamp

### `assignment_groups`

Associates assignments with groups.

### `submissions`

Stores student submission acknowledgement and progress information.

---

# 🔗 Database Relationships

The main database relationships are:

```text
Users
  │
  ├───────────────┐
  │               │
  ▼               ▼
Groups        Assignments
  │               │
  ▼               ▼
Group Members  Assignment Groups
  │               │
  └───────┬───────┘
          ▼
     Submissions
```

The relational structure allows the system to determine:

- Which students belong to a group
- Which student is the group leader
- Which assignments are assigned to a group
- Which students have confirmed an assignment
- How much of a group has completed an assignment

---

# 🏗️ Project Architecture

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
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── GroupManagement.jsx
│   │   │   ├── AssignmentDetails.jsx
│   │   │   └── AdminDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── groupService.js
│   │   │   ├── assignmentService.js
│   │   │   └── submissionService.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# 🔌 API Structure

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Groups

```text
POST   /api/groups
GET    /api/groups
GET    /api/groups/:groupId
POST   /api/groups/:groupId/members
DELETE /api/groups/:groupId/members/:studentId
```

## Assignments

```text
GET    /api/assignments
GET    /api/assignments/:id
POST   /api/assignments
PUT    /api/assignments/:id
DELETE /api/assignments/:id
POST   /api/assignments/:id/groups
```

## Submissions

```text
GET  /api/submissions/:assignmentId
POST /api/submissions/:assignmentId/confirm
GET  /api/submissions/group/:groupId/progress
GET  /api/submissions/admin/tracking
```

Protected endpoints require a valid JWT token.

---

# 🧩 Frontend Architecture

The frontend separates API communication from UI components through service modules.

```text
frontend/src/services/

authService.js
groupService.js
assignmentService.js
submissionService.js
```

This approach keeps API communication separate from presentation logic.

---

# ⚙️ Backend Architecture

The backend follows a modular Express.js architecture.

```text
Routes
  │
  ▼
Authentication Middleware
  │
  ▼
Authorization Middleware
  │
  ▼
Controllers
  │
  ▼
PostgreSQL
```

Responsibilities are separated into:

- Routes
- Controllers
- Middleware
- Database configuration

This structure improves maintainability and makes individual modules easier to modify.

---

# 🎨 UI/UX Design Rationale

The Task 2 redesign focuses on clarity, consistency, responsiveness, and reduced interaction friction.

## 1. Visual Hierarchy

Important information is visually emphasized, including:

- Assignment title
- Deadline
- Submission status
- Group name
- Progress
- User role

## 2. Status Visibility

Status badges and progress indicators make it easy to understand the current state of an assignment.

## 3. Responsive Layout

The interface adapts to:

- Mobile devices
- Tablets
- Laptops
- Desktop screens

## 4. Consistent Interaction

Buttons, inputs, cards, navigation elements, and status components follow a consistent design language.

## 5. User Feedback

The interface provides feedback for:

- Loading
- Successful operations
- Validation errors
- API errors
- Submission acknowledgement
- Empty states

## 6. Reduced Cognitive Load

Related information is grouped into clearly defined sections and cards so users can quickly scan the interface.

---

# 📱 Responsive Design

The application is designed to work across different viewport sizes.

## Recommended Testing Sizes

| Device | Resolution |
|---|---|
| Mobile | 375 × 667 |
| Tablet | 768 × 1024 |
| Desktop | 1440 × 900 |

Responsive behavior includes:

- Flexible dashboard grids
- Responsive navigation
- Stacked mobile layouts
- Adaptive assignment cards
- Responsive forms
- Mobile-friendly controls
- Flexible progress sections

---

# 🧠 Important Backend Logic

## Group Leader Acknowledgement

For a group assignment, only the group leader can acknowledge the submission.

The backend validates:

- Assignment existence
- Assignment submission type
- Assignment/group relationship
- Student group membership
- Group leader status

After successful validation, acknowledgement is propagated to the members of the group.

```text
Group Leader
     │
     │ Confirm Submission
     ▼
Backend Validation
     │
     ├── Assignment
     ├── Group
     ├── Membership
     └── Leader
     │
     ▼
Submission Updates
     │
     ├── Member 1 → Confirmed
     ├── Member 2 → Confirmed
     └── Member 3 → Confirmed
     │
     ▼
Group Progress Updated
```

---

# 🧾 Validation & Error Handling

The application validates important operations on both frontend and backend.

Examples include:

- Required login fields
- Registration fields
- Password length
- Group membership
- Group leader authorization
- Assignment existence
- Assignment/group association
- Student membership
- Submission type
- Unauthorized API access

The frontend provides user-friendly feedback when an operation succeeds or fails.

---

# 🔒 Security Considerations

The application implements several security practices:

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Role-based authorization
- Protected frontend routes
- Environment variables for secrets
- Database credentials excluded from source control
- Server-side group leader validation
- Server-side group membership validation
- Authentication state verification

---

# 🐳 Docker Support

The project contains Docker configuration for running the application in a consistent environment.

## Prerequisites

Install:

- Docker Desktop
- Git
- Node.js
- npm

---

# 💻 Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Vsvardhan55/Joineazy-Task-1.git
cd Joineazy-Task-1
```

## 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit real credentials to GitHub.

## 3. Configure Frontend Environment

Create:

```text
frontend/.env
```

For local development:

```env
VITE_API_URL=http://localhost:5000/api
```

## 4. Install Backend Dependencies

```bash
cd backend
npm install
```

## 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

# ▶️ Run the Application

## Start Backend

From the backend directory:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

## Start Frontend

From the frontend directory:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🐳 Run Using Docker

From the project root:

```bash
docker compose up -d --build
```

To stop the application:

```bash
docker compose down
```

---

# 🧪 Production Build

The frontend production build has been successfully verified using:

```bash
npm run build
```

Build result:

```text
vite v8.3.0 building client environment for production...
✓ 93 modules transformed.
computing gzip size...

dist/index.html                   0.45 kB
dist/assets/index-D2W4dRP2.css   36.57 kB
dist/assets/index-DsniImbz.js   383.33 kB

✓ built successfully
```

The production build is generated in:

```text
frontend/dist/
```

---

# 🔄 Student Workflow

```text
Register / Login
       │
       ▼
Student Dashboard
       │
       ▼
Create / Manage Group
       │
       ▼
View Group Members
       │
       ▼
View Assigned Assignments
       │
       ▼
Open Assignment
       │
       ▼
View Assignment Details
       │
       ▼
Open OneDrive Resource
       │
       ▼
Complete Assignment
       │
       ▼
Confirm Submission
       │
       ▼
Group Progress Updated
```

---

# 🔄 Professor Workflow

```text
Professor Login
       │
       ▼
Professor Dashboard
       │
       ▼
View Analytics
       │
       ▼
Create Assignment
       │
       ▼
Configure Assignment
       │
       ├── Title
       ├── Description
       ├── Due Date
       ├── Submission Type
       └── OneDrive Link
       │
       ▼
Assign to Group
       │
       ▼
Monitor Submissions
       │
       ▼
View Confirmed / Pending Students
       │
       ▼
Monitor Overall Progress
```

---

# 📸 Screenshots

Screenshots can be added to the repository after deployment.

Recommended screenshots:

```text
docs/
└── screenshots/
    ├── login.png
    ├── register.png
    ├── student-dashboard.png
    ├── group-management.png
    ├── assignment-details.png
    ├── admin-dashboard.png
    └── submission-tracking.png
```

Recommended README sections after adding screenshots:

```markdown
## Login

![Login](docs/screenshots/login.png)

## Student Dashboard

![Student Dashboard](docs/screenshots/student-dashboard.png)

## Group Management

![Group Management](docs/screenshots/group-management.png)

## Assignment Details

![Assignment Details](docs/screenshots/assignment-details.png)

## Professor Dashboard

![Professor Dashboard](docs/screenshots/admin-dashboard.png)

## Submission Tracking

![Submission Tracking](docs/screenshots/submission-tracking.png)
```

---

# 🎥 Demo Video

A short demo video can be added to demonstrate the complete application workflow.

Recommended demonstration:

```text
Login
  ↓
Student Dashboard
  ↓
Group Management
  ↓
Assignment Details
  ↓
Submission Confirmation
  ↓
Group Progress
  ↓
Professor Login
  ↓
Professor Dashboard
  ↓
Assignment Management
  ↓
Submission Tracking
```

Demo video:

> Add deployed demo video link here.

---

# ☁️ Deployment

The frontend is compatible with modern frontend hosting platforms such as:

- Vercel
- Netlify

The backend can be deployed to a Node.js-compatible hosting provider.

## Production Environment Variables

### Backend

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_production_jwt_secret
```

### Frontend

```env
VITE_API_URL=your_deployed_backend_api_url
```

Never expose the following in frontend source code or public repositories:

- Database credentials
- JWT secrets
- Private API keys

---

# 📌 Project Status

## Completed

- [x] Student registration
- [x] Student login
- [x] Professor/Admin login
- [x] JWT authentication
- [x] Role-based authorization
- [x] Protected frontend routes
- [x] Group creation
- [x] Group member management
- [x] Group leader handling
- [x] Assignment creation
- [x] Assignment editing
- [x] Assignment deletion
- [x] Assignment-to-group assignment
- [x] Individual submission support
- [x] Group submission support
- [x] Submission acknowledgement
- [x] Group acknowledgement propagation
- [x] Group progress tracking
- [x] Admin submission tracking
- [x] Dashboard analytics
- [x] OneDrive resource links
- [x] PostgreSQL integration
- [x] Neon PostgreSQL integration
- [x] Responsive UI
- [x] Task 2 UI/UX redesign
- [x] Improved loading states
- [x] Improved error handling
- [x] Improved form validation
- [x] Responsive dashboard layouts
- [x] Production frontend build verification
- [x] Git `task2` branch
- [x] GitHub `task2` branch

---

# 🌿 Git Branch

Task 2 development is maintained on:

```text
task2
```

Latest Task 2 implementation commit:

```text
5e76411 feat: complete Joineazy Task 2 enhancements
```

The Task 2 branch has been pushed to GitHub.

---

# 🔗 Repository

GitHub Repository:

https://github.com/Vsvardhan55/Joineazy-Task-1

Task 2 Branch:

https://github.com/Vsvardhan55/Joineazy-Task-1/tree/task2

---

# 👨‍💻 Developer

**Sethu Vardhan Valluri**

B.Tech – Electronics & Communication Engineering

### GitHub

https://github.com/Vsvardhan55

### LinkedIn

https://www.linkedin.com/in/sethu-vardhan-valluri/

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Build Tool | Vite |
| Backend | Node.js |
| API | Express.js |
| Authentication | JWT |
| Password Security | bcryptjs |
| Database | PostgreSQL |
| Database Hosting | Neon PostgreSQL |
| Containerization | Docker |
| Version Control | Git / GitHub |
| API Communication | REST APIs |

---

# 📚 Design Decisions

## Modular Backend

The backend separates responsibilities between:

- Routes
- Controllers
- Middleware
- Database configuration

This improves maintainability and makes the API easier to extend.

## Service-Based Frontend

Frontend API communication is separated into dedicated service modules.

This keeps components focused on UI and user interaction.

## JWT Authentication

JWT provides stateless authentication for protected API requests and supports role-based access control.

## PostgreSQL

PostgreSQL is used because the application contains relational entities such as:

- Users
- Groups
- Group Members
- Assignments
- Assignment Groups
- Submissions

## Responsive UI

Responsive layouts allow the application to work across:

- Mobile
- Tablet
- Laptop
- Desktop

---

# 🧪 Tested Application State

The current local test database includes:

| Data | Count |
|---|---:|
| Users | 4 |
| Students | 3 |
| Admin/Professor | 1 |
| Groups | 1 |
| Group Members | 3 |
| Assignments | 2 |
| Confirmed Submissions | 4 |
| Pending Submissions | 2 |
| Overall Progress | 67% |

The test data was used to verify:

- Student login
- Admin login
- Group management
- Assignment management
- Individual submission handling
- Group submission acknowledgement
- Group progress
- Admin submission tracking

---

# 📝 Task 2 Implementation Summary

The Task 2 implementation improved the original application in three main areas.

## Frontend

- Redesigned major screens
- Improved dashboard layouts
- Improved forms
- Added responsive behavior
- Added visual status indicators
- Added progress indicators
- Improved authentication screens
- Improved assignment details
- Improved group management
- Improved professor dashboard

## Backend

- Improved assignment retrieval
- Added submission type handling
- Added individual submission handling
- Added group submission handling
- Added group leader validation
- Added acknowledgement propagation
- Added group progress tracking
- Added administrator submission tracking
- Improved database connection configuration

## Database

The existing PostgreSQL structure was extended to support assignment submission type and improved submission tracking.

---

# 🚀 Future Improvements

Potential future enhancements include:

- Dedicated course management
- Course enrollment
- Assignment comments
- File upload support
- Notification system
- Email notifications
- Professor profile management
- Student profile management
- Advanced analytics
- Assignment filtering and search
- Pagination
- Activity history
- Real-time notifications
- Automated testing
- CI/CD pipeline

---

# 📜 Assessment

This project was developed as part of the:

**Joineazy Full Stack Intern Technical Assessment**

### Task 1

Student, Group & Assignment Management System

### Task 2

UI/UX enhancement, responsive design improvements, assignment submission workflows, group acknowledgement logic, backend improvements, and submission progress tracking.

---

# 📄 License

This project was developed for the Joineazy Full Stack Intern technical assessment.

All assessment-related source code and implementation are intended for evaluation purposes.