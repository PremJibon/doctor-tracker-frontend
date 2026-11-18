# Doctor Tracker — Clinical Administrative Portal

**Doctor Tracker** is a healthcare administrative web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **TanStack Query**. It delivers a calm "Clean Clinical" user experience designed for medical clinic administrators to oversee doctor rosters, patient cohorts, and hospital workload analytics with sub-second responsiveness and strict WCAG AA accessibility.

---

## 1. Description & Elevator Pitch

Doctor Tracker provides medical staff and healthcare executives with real-time operational visibility into clinical capacity and patient intake. Consuming a decoupled Express + MongoDB REST API, it guarantees strict access control, zero-leak in-memory JWT authentication, seamless 401 token refresh queueing, and responsive data visualizations that scale seamlessly from a 360px mobile handset up to widescreen desktop workstations.

---

## 2. Live Demo & Deployment

| Resource | Target URL | Status |
| :--- | :--- | :--- |
| **Live Frontend Application** | `https://doctor-tracker-frontend.vercel.app` *(or your Vercel deployment URL)* | Ready for Vercel |
| **Live Backend REST API** | `https://doctor-tracker-backend.onrender.com/api` *(or your backend URL)* | Active |
| **Local Development API** | `http://localhost:5000/api` | Local server |

### Demo Credentials
For testing and evaluation:
* **Email**: `admin@clinic.com`
* **Password**: `admin123456`

> [!TIP]
> **One-Click Autofill**: On the `/login` page, click the **"Admin Demo"** button to auto-fill these credentials instantly with zero manual typing.

> [!NOTE]
> **Free-Tier Backend Cold-Start**: If hosted on a free-tier cloud platform (such as Render or Railway), the backend spins down after inactivity. The initial request may take **45 to 60 seconds** to wake up the server. If any request exceeds 3 seconds, Doctor Tracker displays a gentle *"Waking up the server (this can take up to a minute on free tier)..."* alert, preventing silent hangs.

---

## 3. Visual Interface & Screenshot Guide

The user interface implements the **"Clean Clinical"** healthcare design system: calm slate neutral surfaces (`#F6F8FA`), deep teal sidebar chrome (`#0F2A33`), Inter typography, and semantic status indicators strictly reserved for state changes.

### Required Screenshot Capture Checklist (`docs/screenshots/`)

To include your own captured screenshots in this repository, save them into `docs/screenshots/` using the following exact filenames:

| Viewport | Route | Filename | Key Visuals to Capture |
| :--- | :--- | :--- | :--- |
| **Desktop (1440px)** | `/login` | `docs/screenshots/desktop-login.png` | Clean Clinical card, Inter typography, "Admin Demo" autofill button |
| **Desktop (1440px)** | `/dashboard` | `docs/screenshots/desktop-dashboard.png` | 3 KPI StatCards, Caseload BarChart, 7d/30d/12m AreaChart, Conditions Donut |
| **Desktop (1440px)** | `/doctors` | `docs/screenshots/desktop-doctors.png` | SearchInput, FilterBar with badges, sort dropdown, accessible DataTable |
| **Desktop (1440px)** | `/doctors/[id]` | `docs/screenshots/desktop-doctor-detail.png` | Practitioner profile hero, sub-roster table, Add Patient modal trigger |
| **Desktop (1440px)** | `/patients` | `docs/screenshots/desktop-patients.png` | Severity-coded condition badges, doctor links, Edit & Delete action buttons |
| **Mobile (375px)** | `/dashboard` | `docs/screenshots/mobile-dashboard.png` | Stacked KPI cards, responsive Recharts charts with angled/truncated labels |
| **Mobile (375px)** | `/doctors` | `docs/screenshots/mobile-doctors.png` | Stacked responsive card layout, mobile search and filter trigger |
| **Mobile (375px)** | Open Drawer | `docs/screenshots/mobile-drawer.png` | Deep teal slide-over drawer with backdrop blur and touch targets |
| **Mobile (375px)** | `/patients` | `docs/screenshots/mobile-patients.png` | Mobile patient card stack, severity badges, touch-friendly action buttons |

---

## 4. Setup Guide

### Prerequisites
* **Node.js**: v20.x or higher
* **npm**: v10.x or higher
* **Backend API**: Running locally on `http://localhost:5000/api` or deployed remotely.

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PremJibon/doctor-tracker-frontend.git
   cd doctor-tracker-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   Add your backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at [http://localhost:3000](http://localhost:3000).

5. **Typecheck & Linting**:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

---

## 5. System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Client (App Router)             │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   Protected Layout    │ <---> │   In-Memory Auth Store │  │
│  │ (Session Verification)│       │  (Zero XSS Token Leak)│  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│              ▼                               ▼              │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │ TanStack Query Hooks  │ <---> │ Axios Client Instance │  │
│  │(keepPreviousData, URL)│       │ (401 Interceptor +    │  │
│  └───────────────────────┘       │  Cold-Start Monitor)  │  │
└──────────────────────────────────────────────┬──────────────┘
                                               │
                                 CORS REST API │ withCredentials: true
                                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Express.js + MongoDB REST API Server          │
│               - Short-lived Access Token Header             │
│               - httpOnly, Secure Refresh Token Cookie       │
└─────────────────────────────────────────────────────────────┘
```

* **Data Flow**: UI Components trigger custom TanStack Query feature hooks (`useDoctors`, `usePatients`, `useDashboardSummary`). The hook calls typed API functions passing through a unified Axios instance.
* **URL as Source of Truth**: All search strings (400ms debounced), specialty filters, hospital tags, date ranges, and page offsets live in URL search parameters (`?search=...&page=1`), enabling bookmarkable and shareable views.
* **Resilience**: A global cold-start watcher monitors in-flight API requests. If a free-tier backend cold-start exceeds 3 seconds, a non-blocking toast informs the user that the server is waking up.

---

## 6. Technical Decisions Deep Dive

### Decision 1: In-Memory Access Token Storage vs. `localStorage`
* **Context**: Single-page web applications often store authentication tokens in `localStorage` or `sessionStorage` for persistence across reloads.
* **Problem**: Storing tokens in `localStorage` exposes them directly to Cross-Site Scripting (XSS) vectors. Any malicious third-party script or dependency could extract the access token.
* **Solution**: The access token is stored strictly **in-memory** within a private module scope (`src/lib/auth-token.ts`). The refresh token is transmitted as an `httpOnly`, `SameSite=Lax` cookie managed exclusively by the browser. 
* **Trade-off & Recovery**: On browser refresh or page reload, the application triggers a silent refresh call (`POST /auth/refresh`) inside the protected layout. If successful, memory state is immediately repopulated without prompting the user. On 401 expiration, an Axios interceptor queues pending requests, refreshes the token once, and replays the requests without session disruption.

### Decision 2: TanStack Query + URL Search Params vs. Global Redux/Context
* **Context**: Complex table filters (search, multi-criteria filtering, date range, pagination) require consistent state across views.
* **Problem**: Storing list filters in global client state (e.g. Redux or Context) decouples the UI from the browser's URL bar, breaking back/forward navigation and preventing direct bookmarking.
* **Solution**: URL search parameters (`useSearchParams` and `useRouter`) are the single source of truth for all query filters. TanStack Query utilizes these parameters directly as cache keys (e.g. `['doctors', { page, search, specialization }]`). 
* **Benefits**: 
  1. `keepPreviousData` guarantees flicker-free pagination transitions while new pages are being fetched.
  2. Cache invalidation on mutation ensures that adding or deleting a record automatically synchronizes table views across the app.
  3. Zero boilerplate compared to Redux slice management.

---

## 7. Design System: "Clean Clinical"

Implemented via Tailwind CSS v4 and custom semantic design tokens in `src/app/globals.css`:
* **Page Background**: `#F6F8FA`
* **Surface Cards**: `#FFFFFF`
* **Muted Surfaces**: `#EEF2F6`
* **Dividers & Borders**: `#E2E8F0`
* **Primary Healthcare Teal**: `#0F766E` (`#115E59` hover)
* **Sidebar Chrome**: `#0F2A33`
* **Status Indicators**: Success `#15803D`, Warning `#B45309`, Danger `#B91C1C`
* **Data Visualization**: `--chart-1` to `--chart-5` (`#0F766E`, `#4F46E5`, `#D97706`, `#DB2777`, `#64748B`)
* **Typography**: Inter via `next/font/google` (Weights 400, 500, 600, 700).

---

## 8. Project Status & Roadmap

- [x] **Step 1: Setup & Foundations** — Next.js 16 (App Router + Turbopack) + Tailwind v4 + Clean Clinical design tokens + Axios client + Providers
- [x] **Step 2: Authentication & Route Guarding** — `/login` + in-memory access token + 401 retry queue with httpOnly refresh cookie + protected layout
- [x] **Step 3: App Shell & Responsive Navigation** — Persistent deep teal sidebar (`#0F2A33`) + mobile drawer + sticky header + PageHeader
- [x] **Step 4: Reusable Shared Component Suite** — DataTable (dual desktop table / mobile card stack), Pagination, SearchInput (400ms debounce), FilterBar, ConfirmDialog, EmptyState, StatCard
- [x] **Step 5: Doctors Directory & Creation** — URL-driven search/specialty/hospital/date filters + `CreateDoctorDialog` with Zod validation
- [x] **Step 6: Doctor Detail & Patient Roster** — Profile card + sub-patients data table + `AddDoctorPatientDialog` + delete flow
- [x] **Step 7: Dedicated Patients Page** — Global directory + condition/doctor/date filters + `EditPatientDialog` + `ConfirmDialog`
- [x] **Step 8: Analytics Dashboard** — Clinical KPI cards + 3 responsive Recharts visualizations (Top 10 Caseload, 7d/30d/12m Admissions, Conditions Donut)
- [x] **Step 9: Polish & Audits** — 4-state lifecycle (skeleton, empty, error retry, success) + WCAG AA compliance + zero horizontal scroll (360px–1440px)
- [x] **Step 10: Production Readiness & Deployment** — Strict TypeScript (`noEmit`), zero ESLint errors, Next.js static and partial prerendering optimization, ready for Vercel deployment.

---

## 9. Deployment (Vercel)

1. Import repository `https://github.com/PremJibon/doctor-tracker-frontend` into [Vercel](https://vercel.com).
2. Configure Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com/api` or `http://localhost:5000/api` for local testing).
3. Deploy — Next.js App Router will generate static shells and partial prerendered dynamic routes automatically.
