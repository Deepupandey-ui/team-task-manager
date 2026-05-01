🚀 Team Task Manager (Full-Stack Project)
A production-ready web application that enables teams to efficiently manage projects, assign tasks, and track progress with secure role-based access control.

🧠 Project Overview
Team Task Manager is designed to solve real-world collaboration problems. It allows teams to organize work into projects, assign responsibilities, and monitor progress through a structured workflow.
The system ensures that:
Admins can manage projects and assign tasks
Members can track and update their work
Teams have visibility into progress and deadlines

✨ Key Features
🔐 Authentication & Security
User Signup & Login
Secure password hashing
JWT-based authentication
Role-based access control (ADMIN / MEMBER)

📁 Project Management
Create and manage projects
Add/remove team members
View all projects assigned to a user

📋 Task Management
Create tasks with deadlines
Assign tasks to team members
Update task status (TODO / IN_PROGRESS / DONE)
Track overdue tasks

📊 Dashboard & Insights
Total tasks overview
Completed vs pending tasks
Overdue tasks tracking
User-specific task visibility

🏗️ System Architecture
This project follows a clean layered architecture:
Controller Layer → Handles HTTP requests
Service Layer → Contains business logic
Repository Layer → Handles database operations
Entity Layer → Defines database models

⚙️ Tech Stack
Backend
Java + Spring Boot
Spring Security (Authentication & Authorization)
JWT (Token-based authentication)
Database
PostgreSQL (Relational Database)
ORM
Hibernate (JPA)
Tools
Postman (API Testing)
Railway (Deployment)

🗄️ Database Design (Simplified)
User → stores user details & roles
Project → stores project info
Task → stores task details
ProjectMembers → manages user-project relationships
Relationships:
One user can be part of multiple projects
One project can have multiple tasks
Each task is assigned to one user

🔐 Role-Based Access Control
ADMIN
Create and manage projects
Add/remove members
Assign tasks
MEMBER
View assigned tasks
Update task status

🔄 API Endpoints Overview
Authentication
POST /api/auth/signup
POST /api/auth/login
Projects
POST /api/projects
GET /api/projects
POST /api/projects/{id}/members
Tasks
POST /api/tasks
GET /api/tasks
PUT /api/tasks/{id}
DELETE /api/tasks/{id}
Dashboard
GET /api/dashboard

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone

2️⃣ Configure Database
Update application.properties:
spring.datasource.url=jdbc:postgresql://localhost:5432/taskdb
spring.datasource.username=your_username
spring.datasource.password=your_password

3️⃣ Run the Application
mvn spring-boot

🌐 Deployment
The application is deployed on Railway and is accessible via:
👉

📌 Future Improvements
Notification system (Email / In-app)
Real-time updates using WebSockets
File attachments in tasks
Activity logs for projects

🎯 Learning Outcomes
This project demonstrates:
Backend architecture design
REST API development
Role-based security implementation
Database relationship management
Real-world problem-solving

👨‍💻 Author
Deepu

⭐ Final Note
This is not just a CRUD application — it is a structured system built with scalability, security, and real-world use cases in mind.
