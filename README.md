# Groupr (TruthLayer)

Groupr is a comprehensive platform designed for high school and university students to manage group projects equitably. It solves the classic "free-rider" problem by automatically tracking contributions, managing tasks, and generating fair, data-backed contribution scores. Teachers are equipped with a powerful dashboard to monitor team dynamics, resolve disputes, and grade with confidence.

---

## 🚀 Features & How They Work

### 1. Role-Based Ecosystem
- **Students:** Can create/join projects, manage tasks, log offline work, connect integrations, and monitor their contribution scores.
- **Teachers:** Have a specialized dashboard to view all projects, track real-time progress, audit individual student contributions, and download comprehensive HTML/PDF grading reports.

### 2. Fair Contribution Scoring
- **Automated Tracking:** Groupr connects to external sources (like Google Docs and GitHub) to automatically quantify activity.
- **Offline Logs:** Students can manually log offline work (e.g., "Library research", "Poster printing") with corroboration required from teammates.
- **Dynamic Calculation:** The backend scoring engine processes tasks completed, integration activity, and offline logs to generate an evolving, fair contribution percentage for each member.

### 3. Task Management (Kanban)
- A built-in drag-and-drop Kanban board (To Do, In Progress, Blocked, Done) keeps teams organized. Task completion is heavily weighted in the contribution scoring engine.

### 4. Dispute Resolution System
- If a student feels their score or task distribution is unfair, they can file a dispute. Leaders and Teachers can review the audit log, mediate the issue, and optionally apply a score override.

### 5. Integrations & Consents
- **GitHub & Google Docs:** Students can authenticate with OAuth to pull in commit histories and document edits.
- **Privacy First:** Source tracking requires explicit opt-in consent from each team member before their data is ingested and analyzed.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Vanilla CSS variables)
- **Design System:** "Meadow-glass ledger" (Modern, glassmorphism-inspired UI with vibrant, premium green accents).
- **Routing:** React Router DOM (v6)
- **State Management:** React Context API (AuthContext, ProjectContext, NotificationContext)
- **Hosting:** Vercel (SPA routing configured via `vercel.json`)

### Backend
- **Framework:** Spring Boot (Java 17+)
- **Architecture:** Modular Monolith
- **Database:** PostgreSQL (Spring Data JPA / Hibernate)
- **Security:** Spring Security with Stateless JWT (JSON Web Tokens) and Nimbus JOSE + JWT
- **Hosting:** Railway (Production DB and API)

---

## 🏗️ System Architecture & Methods

- **Modular Monolith:** The backend is divided into distinct, loosely-coupled domains (`auth`, `project`, `task`, `scoring`, `source`, `workflow`, `report`, `user`). This keeps the codebase highly maintainable while avoiding the operational overhead of microservices.
- **Stateless Authentication:** Session state is managed via JWTs stored securely on the client. The backend verifies the token signature on every request, ensuring highly scalable, database-free authentication checks.
- **API Resilience:** The frontend uses a custom `httpClient` wrapper that normalizes errors, parses Spring Boot's `ProblemDetail` responses, and gracefully degrades to mock data if the backend is explicitly disabled during local development.
- **Asynchronous Workflows:** Heavy operations (like score recalculation or report generation) are isolated in dedicated services, ensuring the main thread remains responsive.

---

## 🔄 User Flow

1. **Onboarding:** 
   - User registers as a Student or Teacher.
   - 3-Step Wizard: Setup profile (School/Grade) → Create or Join a project → Invite teammates via email.
2. **Dashboard:** 
   - Landing view showing the user's current contribution score, ranking, and recent activity.
3. **Collaboration:** 
   - Users navigate to the **Tasks** tab to claim work.
   - Users navigate to the **Sources** tab to link GitHub/Google Drive.
   - Users navigate to the **Offline Log** tab to submit manual work for peer review.
4. **Resolution:** 
   - If issues arise, the **Disputes** tab allows for transparent conflict resolution.
5. **Grading (Teacher Flow):** 
   - Teachers log in and are routed to `/teacher`.
   - They view a bird's-eye summary of all projects, drill down into specific teams, and export final Contribution Reports.

---

## 💻 How to Use (Local Setup)

### Prerequisites
- Node.js (v18+)
- Java 17+ (JDK)
- PostgreSQL (Local or Docker)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your `application.properties` (or `application-dev.yml`) with your local PostgreSQL credentials and JWT secret.
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will run on `http://localhost:8080`.*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

### Production Deployment
- **Frontend:** Pushed to Vercel. Ensure the `VITE_API_BASE_URL` environment variable is set to the Railway URL.
- **Backend:** Pushed to Railway. Ensure `DATABASE_URL` and CORS allowed origins are properly configured in the Railway environment variables.
