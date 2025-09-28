# Talent Trail

**Talent Trail** is a full-stack web application designed to help organizations manage interns, teams, projects, modules, functions, and test cases with ease. Built with a React frontend and a Spring Boot backend, the system provides a comprehensive suite of CRUD functionalities for efficient intern management and project tracking.

---

## ✨ Features

- 🔁 Full CRUD operations for:
  - Interns
  - Teams
  - Projects
  - Modules
  - Functions
  - Test Cases
- 📁 Relational data management between teams, interns, and projects
- 🧩 Modular architecture for scalability and maintainability
- 🔒 Role-based access control (optional extension)
- 📊 Dashboard for quick overview of projects and intern status (optional feature)

---

## 🛠️ Tech Stack

### Frontend
- **React** (with Hooks & Context API)
- **React Router** for navigation
- **Axios** for API requests
- **Bootstrap / Material UI** for styling

### Backend
- **Spring Boot**
- **Spring Data JPA** for ORM
- **Spring Web** for REST APIs
- **H2 / PostgreSQL** for the database
- **Lombok** for reducing boilerplate
- **Spring Security** (optional, for authentication/authorization)

---

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- Java 17+
- Maven

---

### Backend Setup

```bash
cd backend
./mvnw spring-boot:run
