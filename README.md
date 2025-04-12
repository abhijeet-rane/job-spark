# 💼 JobSpark: Intelligent JD Summarization & Candidate Matching

## 🎯 Objective

**JobSpark** is an AI-powered web application designed to automate and enhance the job screening process. It aims to:

1. ✅ Read and summarize Job Descriptions (JDs)
2. 📄 Extract structured data from candidate CVs
3. 🧠 Match candidates to job requirements using an intelligent scoring system
4. 📋 Shortlist top candidates based on a configurable threshold (e.g., 80%)
5. 🕒 Schedule interviews and send personalized invitations via email
6. 🧾 Use SQLite for persistent long-term memory and audit logging
7. 🔐 Offer secure login/register functionality with role-based access control for applicants and admins

---

## 🔗 Prototype

👉 **[Click here to view the prototype](https://job-spark.vercel.app/)**  

---

## 🧑‍💻 Tech Stack

### 🖥️ Frontend
- **React.js** (with Vite or CRA)
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **shadcn/ui** or **Chakra UI** - Pre-built components
- **React Router**, **HeroIcons**, **EmailJS**
- **Chart.js** / **Recharts** - For visualizing match scores

### 🔧 Backend
- **FastAPI** or **Flask** - Python-based API server
- **LangChain** + **OpenAI GPT-4 / Claude**
- **Sentence-BERT**, **spaCy**, **PyMuPDF**, **docx2txt**
- **SQLite** + **SQLAlchemy ORM** - Persistent storage
- **RESTful APIs** - Frontend-backend communication

### 🚀 Deployment
- **Frontend:** Vercel
- **Database:** SQLite (locally hosted with persistent memory)

---

## 🤖 AI Agents & Their Responsibilities

### 1. 📄 JD Summarizer Agent
- **Input:** Raw JD (PDF, DOCX, or plain text)
- **Output:** Structured summary — title, skills, experience, qualifications, role

### 2. 🧾 CV Parser Agent
- **Input:** Raw CV (PDF, DOCX)
- **Output:** Extracted fields: Name, Email, Education, Skills, Experience, Certifications

### 3. ⚖️ Matching Agent
- **Logic:** Sentence similarity (Sentence-BERT) + keyword intersection
- **Output:** Match score (0–100) with breakdown by category

### 4. 🏆 Shortlisting Agent
- **Filters** candidates based on threshold (e.g., ≥80%)
- **Triggers** interview scheduler + stores in SQLite

### 5. 📅 Interview Scheduler Agent
- **Picks** available slots
- **Sends** personalized emails with time, format, calendar invite
- **Uses** OpenAI for human-like email content

### 6. 💾 Memory Agent
- **Logs** all parsed, matched, scheduled data into SQLite
- **Ensures** persistent, queryable memory for audits or re-runs

---

## ✅ Expected Deliverables

- 🔹 Fully responsive, production-ready frontend
- 🔹 Modular, well-documented backend APIs
- 🔹 AI-powered multi-agent pipeline with memory and logging
- 🔹 SQLite integration for long-term data persistence
- 🔹 Secure login/register with role-based access control
- 🔹 End-to-end hosted demo showcasing complete functionality
