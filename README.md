# Doctor Tracker — Clinical Administrative Portal

**Doctor Tracker** is a healthcare administrative web application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **TanStack Query**. It delivers a calm "Clean Clinical" user experience designed for medical clinic administrators to oversee doctor rosters, patient cohorts, and hospital workload analytics with sub-second responsiveness and strict WCAG AA accessibility.

---

## 1. Description & Elevator Pitch

Doctor Tracker provides medical staff and healthcare executives with real-time operational visibility into clinical capacity and patient intake. Consuming a decoupled Express + MongoDB REST API, it guarantees strict access control, zero-leak in-memory JWT authentication, seamless 401 token refresh queueing, and responsive data visualizations that scale seamlessly from a 360px mobile handset up to widescreen desktop workstations.

---

## 2. Setup Guide

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

## 3. System Architecture & Data Flow

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

## 4. Technical Decisions Deep Dive

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

## 5. Design System: "Clean Clinical"

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

## 6. Project Status & Roadmap

- [x] **Step 1: Setup & Foundations** — Next.js 16 + Tailwind v4 + Clean Clinical tokens + Axios client + Providers
- [x] **Step 2: Authentication & Route Guarding** — `/login` + in-memory token + 401 retry queue + protected layout
- [x] **Step 3: App Shell & Responsive Navigation** — Persistent deep teal sidebar + mobile drawer + PageHeader
- [ ] **Step 4: Reusable Shared Component Suite** — DataTable, Pagination, SearchInput, FilterBar, ConfirmDialog, EmptyState
- [ ] **Step 5: Doctors Directory & Creation** — URL-driven filters + creation dialog
- [ ] **Step 6: Doctor Detail & Patient Roster** — Doctor profile + sub-table + add/delete patient
- [ ] **Step 7: Dedicated Patients Page** — Global patient directory + edit modal + delete with ConfirmDialog
- [ ] **Step 8: Analytics Dashboard** — KPI cards + 3 Recharts data visualizations
- [ ] **Step 9: Polish & Audits** — 4-state lifecycle + WCAG AA accessibility audit + responsive pass
- [ ] **Step 10: Production Deployment** — Vercel deployment + production verification
