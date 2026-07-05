# Veridion AI

**The AI Virtual Data Room Built for Modern Due Diligence**

Veridion AI is an intelligent assistance platform that transforms complex M&A deal reviews into intelligent conversations. It combines secure document exchange, AI-powered analysis, and automated risk intelligence, helping sellers share with confidence and buyers decide with clarity.

---

## 🚀 Features

- **Secure Deal Workspaces**: Dedicated encrypted environments for individual deals.
- **Role-Based Access Control (RBAC)**: Strict segregation between Seller Admins, Buyer Executives, Lawyers, and Finance roles.
- **RAG-Powered AI Search**: Ask complex legal, financial, or operational questions directly against uploaded deal documents. Answers include direct citations.
- **Automated Risk Engine**: Custom Regex-based risk rules that automatically flag missing clauses, unusual dependencies, and liabilities across thousands of pages.
- **Intelligent Due Diligence Reports**: One-click generation of comprehensive markdown reports summarizing the entire deal, risks, and findings.
- **Document Management**: Upload, parse, and analyze DOCX and PDF documents securely.

## 🛠️ Technology Stack

**Frontend**
- React + TypeScript
- Tailwind CSS (with custom Glassmorphism/Dark Mode UI)
- Vite

**Backend**
- Python 3.12 + FastAPI
- PostgreSQL (Relational Database)
- Qdrant (Vector Database for Embeddings)
- groq API (LLM)
- SQLAlchemy + Alembic

---

## 🐳 Quick Start (Docker)

The easiest way to run Veridion AI locally is using Docker Compose. This will spin up the Backend, PostgreSQL database, pgAdmin, and Qdrant vector store.

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+) for the frontend
- A groq API Key

### 2. Environment Variables
Create a `.env` file in the root directory based on the `.env.example` structure.
You MUST provide your groq API key.
```env
GROQ_API_KEY=your_groq_api_key_here
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=vdrai
POSTGRES_SERVER=postgres
```

### 3. Start the Backend Infrastructure
Run the following command from the root of the project:
```bash
docker compose up --build -d
```
This will start:
- **Backend API**: `http://localhost:8000`
- **Postgres Database**: `localhost:5432`
- **pgAdmin**: `http://localhost:5050`
- **Qdrant**: `http://localhost:6333`

*Note: On first run, Alembic will automatically run migrations to create all database tables.*

### 4. Start the Frontend Application
In a new terminal, navigate to the `frontend` folder, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🏗️ Project Structure

```
├── backend/
│   ├── app/
│   │   ├── ai/            # Gemini LLM and Embeddings integrations
│   │   ├── api/routers/   # FastAPI route definitions
│   │   ├── database/      # SQLAlchemy models & session
│   │   ├── schemas/       # Pydantic validation schemas
│   │   └── services/      # Core business logic
│   ├── alembic/           # Database migration scripts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application views (Dashboard, DealWorkspace, etc.)
│   │   ├── services/      # Axios API integration
│   │   └── hooks/         # Custom React hooks
│   ├── index.css          # Tailwind configuration & global styles
│   └── package.json
├── storage/               # Local volume mounts for uploaded files
└── docker-compose.yml     # Infrastructure orchestration
```

## 🔒 Security Notice

This platform includes simulated security features (like RBAC and JWT auth) for demonstration purposes. Before deploying to production, ensure proper secret management, CORS configuration, SSL/TLS certificates, and hardened database access.
