# ⚡ FormCraft — Conversational Form Engine

> **Forms designed for flow, built to be finished.**  
> An open-source, self-hostable conversational form builder and analytics engine. One-question-at-a-time flow, intelligent skip logic, real-time responses, and zero monthly SaaS bills.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](./package.json)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite+Drizzle-003B57?logo=sqlite&logoColor=white)](https://orm.drizzle.team/)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)

---

## 📌 Problem Statement

Traditional online forms (Google Forms, SurveyMonkey, standard web forms) suffer from dismal completion rates (often <15%) because respondents are presented with a giant wall of input fields. Conversely, premium conversational form tools like Typeform charge exorbitant fees ($35–$100+/month), impose strict monthly response caps, paywall basic conditional branching, and store sensitive respondent data on proprietary third-party cloud infrastructure.

Developers, researchers, event organizers, and student teams need a modern, beautiful, and fluid conversational form engine that:
1. Gives respondents a focused, keyboard-first, one-question-at-a-time experience.
2. Supports complex conditional skip/branching logic.
3. Provides live analytics and CSV exports without subscription paywalls.
4. Stores data in a transparent, self-hosted local database with zero external cloud dependencies.

---

## 🎯 Target Users

- **Developers & Product Builders**: Embed fast, unbranded forms, survey popups, or feedback widgets via a single `<script>` tag or iframe.
- **Educators & Students**: Collect project submissions, peer reviews, lab evaluations, and course feedback with structured templates.
- **Event Organizers & Community Leads**: Gather RSVPs, meal preferences, and attendee details with mobile-first conversational flows.
- **Privacy-Conscious Organizations**: Self-host entire form infrastructure and store all survey data in their own SQLite file without third-party data tracking.

---

## 💡 Solution: FormCraft

**FormCraft** solves this by providing a lightweight, full-stack Next.js 16 web application that enables anyone to build, publish, embed, and analyze interactive forms with zero runtime cost.

By leveraging an embedded SQLite database (`better-sqlite3` + `Drizzle ORM`), the entire backend runs in a single self-contained environment. You can deploy it on any server, container, or VPS in under 60 seconds with no external database subscriptions.

---

## 🚀 Key Features & Core Workflows

### 1. Visual Drag-and-Drop Form Builder
- **9 Specialized Question Types**: Short Text, Long Text, Email, Number, Multiple Choice, Checkboxes, Dropdown, Rating scale (1–10), and Yes/No boolean.
- **Live Interactive Split-Screen Preview**: Real-time rendering of changes as questions, descriptions, placeholders, and themes are edited.
- **Theme & Branding Customizer**: Custom brand colors, dark/light modes, progress bar toggling, and configurable Welcome & Thank You screens.
- **Pre-Configured Starter Templates**: Jumpstart form creation with templates for *Project Submission*, *Developer Bug Report*, *Event RSVP*, *Product Feedback*, and *Contact*.

### 2. Intelligent Conditional Skip Logic Engine
- Define custom branching rules per question (e.g., *"If answer is 'No', jump directly to Question 5"* or *"Submit immediately"*).
- State-machine driven navigation engine that recalculates the shortest path through the question graph while maintaining back-history traversal.

### 3. Fluid Conversational Form Runner
- **One-Question-at-a-Time Interface**: Distraction-free, responsive layout with smooth transitions and real-time completion percentage tracking.
- **Keyboard-First Navigation**: Advance with `Enter ↵`, step back with `Esc`, and navigate choices with keyboard numbers.
- **Built-in Security & Anti-Spam**:
  - Hidden honeypot traps for bot filtering.
  - Client-side and server-side submission time analysis (blocks instant automated bot submissions).
  - Rate limiting per IP.

### 4. Real-Time Responses & Analytical Insights
- **Live Response Feed**: Instant notification and rendering of new respondent answers.
- **Aggregated Question Metrics**: Distribution charts for multiple-choice questions, average scores for ratings, and text breakdowns.
- **One-Click CSV Export**: Instant structured data export for analysis in Excel, Python, or Pandas.

### 5. Multi-Channel Distribution & Integrations
- **Public Shareable Link**: Clean slug URLs (e.g. `/f/project-evaluation`).
- **QR Code Generator**: In-app QR code generation for scanning at events or conferences.
- **Embeddable Widgets**:
  - Inline `<iframe>` embed.
  - Floating popup corner button with a single lightweight `<script>` tag.
- **Webhook Dispatch**: Instant event notification payload sent to Slack, Discord, or custom webhook endpoints on submission.

---

## 🛠️ Tech Stack & Engineering Decisions

| Layer | Technology | Decision Rationale |
|---|---|---|
| **Framework** | Next.js 16.3 (App Router + Turbopack) | Server Actions, dynamic routes, and fast edge-ready compilation |
| **Frontend** | React 19, TypeScript 5, Tailwind CSS 4 | Type safety, zero-runtime styling, and responsive UI |
| **Database** | SQLite (`better-sqlite3`) | Single-file persistence, zero configuration, zero cloud cost, portable backups |
| **ORM** | Drizzle ORM | Schema-first type-safe queries with blazingly fast execution |
| **Icons & Media** | Lucide React | Modern, lightweight icon system |
| **Validation** | Zod | Runtime schema validation for question graphs, form settings, and submissions |
| **QR Generation** | `qrcode` | In-memory SVG/DataURL generation for offline QR code access |

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                           Client Layer                          │
├───────────────────────────────┬─────────────────────────────────┤
│    Admin Dashboard & Builder   │     Conversational Runner       │
│  - Live Form Editor           │  - Step-by-step state machine   │
│  - FormList & Search Filter   │  - Keyboard shortcuts handler   │
│  - Analytics & Charts         │  - Embed widget / Popup modal   │
└───────────────┬───────────────┴─────────────────┬───────────────┘
                │ HTTP / Server Actions           │ Public Submissions
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js 16 Server                          │
├─────────────────────────────────────────────────────────────────┤
│  - Route Handlers (/api/forms, /api/public/submit, /api/qr)     │
│  - Auth Middleware (HMAC SHA-256 signed session cookies)        │
│  - Honeypot & Anti-Bot validation pipeline                      │
│  - Conditional Branching Validator                              │
│  - Webhook Dispatcher (Slack / Discord / Custom HTTP)           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Drizzle ORM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SQLite Engine (WAL Mode)                   │
├─────────────────────────────────────────────────────────────────┤
│  - `forms` Table: Slugs, titles, question JSON graph, settings  │
│  - `responses` Table: Form ID, JSON answers, submission dates   │
│  - `app_settings` Table: Global workspace & AI configurations   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` or set these in your hosting environment:

| Variable | Default | Purpose |
|---|---|---|
| `ADMIN_EMAIL` | `admin@formcraft.local` | Email address used to access the admin dashboard |
| `ADMIN_PASSWORD` | `formcraft-admin` | Password used to log in to the dashboard |
| `AUTH_SECRET` | *(auto-dev)* | HMAC secret key used for signing session cookies |
| `DATA_DIR` | `./data` | Directory where `formcraft.db` SQLite database is saved |
| `OPENAI_API_KEY` | *(optional)* | OpenAI or Groq/Ollama API key for AI form generation |
| `OPENAI_BASE_URL`| `https://api.openai.com/v1` | Custom endpoint for OpenAI-compatible LLM providers |
| `AI_MODEL` | `gpt-4o-mini` | AI model name for drafting form questions |

> **Note**: No secrets or API keys are required for core form creation, running, submission, or export.

---

## 💻 Local Setup & Quickstart

### Prerequisites
- Node.js 20 or higher
- npm, pnpm, or bun

### 1. Clone & Install
```bash
git clone https://github.com/vaibhav25bcs10507-pixel/formcraft.git
cd formcraft
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- Visit `/login` to sign in to the Admin Dashboard.
- **Local defaults** (when no env vars are set): `admin@formcraft.local` / `formcraft-admin`
- **Live demo** (https://formcraft-4sqx.onrender.com): `demo@formcraft.local` / `formcraft-demo`

> Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` before using this for anything beyond a demo.

### 3. Production Build & Run
```bash
npm run build
npm start
```

### 4. Running with Docker Compose (Alternative)
```bash
docker compose up -d
```

---

## 🚢 Deployment

FormCraft is designed to run in any containerized or Node.js environment:

### Deploy to Render

**Live instance:** https://formcraft-4sqx.onrender.com (free tier — the first request after 15 minutes of inactivity may take ~30–60s to wake).

1. Create a **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Choose **Node** environment:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `COOKIE_SECURE=true`, and `DATA_DIR=./data` in Environment Settings.
5. Optional: attach a Persistent Disk at `/data` and set `DATA_DIR=/data` if you want SQLite data to survive redeploys. The demo deployment intentionally runs without a disk, so data resets on redeploy.

### Deploy to Railway / Fly.io / VPS
Use the included `Dockerfile` and `docker-compose.yml` for automated container deployment.

---

## 📽️ Demo & Submission Details

```text
Project Name: FormCraft — High-Conversion Conversational Form Engine
Student Name: Vaibhav (25BCS10507)
Problem Statement: Elimination of form abandonment through conversational UX and self-hosted data ownership
GitHub Repository: https://github.com/vaibhav25bcs10507-pixel/formcraft
Deployed Application: https://formcraft-4sqx.onrender.com
Demo Video: [Link to 3–5 min video demo]
Tech Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, SQLite, Drizzle ORM, Lucide
Major Features:
  1. Conversational step-by-step form runner with keyboard navigation
  2. Visual drag-and-drop form builder with live preview
  3. Conditional skip logic branching engine
  4. Real-time response analytics, charts, and CSV export
  5. Anti-spam honeypot, rate limiting, and webhook dispatching
```

---

## 📜 Acknowledgements & Attribution

FormCraft is an open-source engineering project built upon the architectural foundations of [Formo](https://github.com/Abhishekpundir23/formo). Custom additions include:
- Extended multi-criteria form dashboard with real-time title search, status filters (Live / Draft), and sorting.
- Enhanced response metric summary cards with quick timestamp triage and completion indicators.
- Interactive keyboard navigation badges and dynamic completion percentage meters.
- New specialized academic and developer evaluation templates (*Project Submission*, *Developer Bug Report*).
- Brand and UI customization for student end-term presentation.

Licensed under the **AGPL-3.0 License**.
