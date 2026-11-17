# Product Requirements Document (PRD) — Doctor Tracker (Frontend)

**Source Document**: `Fullstack_Task_Frontend_Focused_Updated_1 (1) (1).pdf`  
**Classification**: Official Assessment Specification (Care Guide BD)  
**System Type**: Administrative Healthcare Management Portal (Next.js 15+ App Router Client)  
**Target Backend**: Standalone Express + MongoDB REST API (`/api`)

---

## 1. Executive Summary & Purpose
**Doctor Tracker** is a high-performance, clinical-grade administrative web application designed for clinic administrators to manage doctor rosters, track patient cohorts, and visualize key clinical metrics. 

The frontend emphasizes:
1. **Exceptional UI/UX Quality**: Follows the "Clean Clinical" design system (deep teal chrome, calm slate surfaces, crisp typography, and strict semantic tokens).
2. **Robust Data Visualization**: Dynamic, accessible, and responsive charts visualizing workload distribution, intake trends, and diagnostic categories.
3. **Resilient Data Architecture**: TanStack Query server-state management with cache invalidation, URL-driven filtering/pagination, and automatic recovery/retry with cold-start feedback.
4. **Strict Accessibility & Mobile Responsiveness**: Seamless experience across 360px (mobile), 768px (tablet), 1024px (laptop), and 1440px+ (desktop) with zero horizontal scrolling and full keyboard/screen-reader accessibility.

---

## 2. Core Functional Requirements

### 2.1 Authentication & Route Guarding
* **Login View (`/login`)**:
  * Clean, centered card interface with clinic branding.
  * Inputs: Email and Password with inline Zod validation.
  * Submits to `POST /api/auth/login`.
  * Response stores short-lived `accessToken` in memory (Zustand or React Context module store); refresh token stored by browser as `httpOnly` cookie (`withCredentials: true`).
  * Instant redirect to `/dashboard` upon successful login.
* **Route Protection**:
  * Unauthenticated requests to protected routes (`/dashboard`, `/doctors`, `/doctors/[id]`, `/patients`) redirect to `/login`.
  * Protected layout verifies session state (`GET /api/auth/me` / token refresh).
  * Smooth loading fallback while verifying session (no flickering).
* **Token Refresh Interceptor**:
  * Axios response interceptor intercepts `401 Unauthorized`.
  * Enqueues pending requests, issues a single call to `POST /api/auth/refresh`.
  * If refresh succeeds, retries original requests with the new access token.
  * If refresh fails (or returns 401), clears in-memory state, displays session expired notification, and routes to `/login`.
* **Logout (`POST /api/auth/logout`)**:
  * Triggered from user profile menu in header/sidebar.
  * Clears memory token, calls logout endpoint to clear httpOnly cookie, and routes to `/login`.

---

### 2.2 Doctor Management (`/doctors` & `/doctors/[id]`)
* **All Doctors Directory (`/doctors`)**:
  * **Data Table & Mobile Cards**: Responsive table on `md+`, stacked cards with badges on `<md`.
  * **Search & Filters**:
    * Search bar with 400ms debounce (queries `?search=` on name).
    * Specialization dropdown filter (e.g., Cardiology, Neurology, Pediatrics, etc.).
    * Hospital filter.
    * Date range filter (`from` and `to`).
    * Filter changes immediately reset page to 1.
    * All active filters, search text, sort key, and page numbers synchronized into URL search parameters.
  * **Doctor Creation Dialog**:
    * Fields: `name`, `specialization`, `hospital`, `phone`, `email`.
    * Validated via React Hook Form + Zod schema before dispatching `POST /api/doctors`.
    * Success: Triggers toast notification, closes modal, and invalidates doctor queries.
* **Doctor Profile & Patient Roster (`/doctors/[id]`)**:
  * **Header/Hero**: Displays doctor's name, specialization badge, hospital, email, phone, and registration date.
  * **Patients Sub-Roster**:
    * Embedded DataTable listing all patients assigned to this doctor (`GET /api/doctors/:id/patients`).
    * Search and pagination within the doctor's roster.
  * **Add Patient Dialog**:
    * Modal to bind a new patient directly to this doctor (`POST /api/doctors/:id/patients`).
    * Fields: `name`, `age`, `gender`, `phone`, `condition`, `admittedAt`.
    * Optimistic UI update or query invalidation on success.
  * **Remove Patient Action**:
    * Delete button per patient with a mandatory `ConfirmDialog` modal ("Are you sure you want to remove this patient?").
    * Dispatches `DELETE /api/doctors/:id/patients/:patientId`.

---

### 2.3 Dedicated Patient Management (`/patients`)
* **Centralized Patient List**:
  * Comprehensive table displaying all patients across doctors (`GET /api/patients`).
  * Columns: Patient Name, Age/Gender, Condition badge, Assigned Doctor (clickable link to doctor profile), Admission Date, Actions.
* **Search & Filters**:
  * Text search on patient name (400ms debounce).
  * Filter by Condition (dropdown/combobox).
  * Filter by Assigned Doctor (`doctorId`).
  * Date range filter on `admittedAt` (`from` / `to`).
  * URL search parameter synchronization for shareable/bookmarkable filtered views.
* **Edit Patient Dialog**:
  * Modal pre-populated with patient attributes.
  * Validates updates and submits `PATCH /api/patients/:id`.
* **Delete Patient Action**:
  * Triggered with `ConfirmDialog` modal.
  * Dispatches `DELETE /api/patients/:id` with toast feedback and query invalidation.

---

### 2.4 Analytics Dashboard (`/dashboard`)
* **KPI Metrics Row**:
  * **Total Doctors**: Icon, value, trend indicator.
  * **Total Patients**: Icon, value, trend indicator.
  * **Avg Patients / Doctor**: Formatted ratio (e.g. `14.2`), descriptive helper caption.
  * Rendered as `StatCard` components with loading skeleton states.
* **Visual Data Charts**:
  1. **Workload Distribution (Bar Chart)**:
     * Endpoint: `GET /api/dashboard/patients-per-doctor`.
     * Shows top 10 doctors ranked by patient count.
     * Horizontal or vertical responsive bar chart with readable labels and tap/hover tooltips.
  2. **Patient Admission Trends (Area/Line Chart)**:
     * Endpoint: `GET /api/dashboard/patients-over-time?range=7d|30d|12m`.
     * Interactive range segmented control (`7 Days`, `30 Days`, `12 Months`).
     * Smooth gradient area fill, formatted dates on X-axis, volume on Y-axis.
  3. **Diagnostic Breakdown (Donut Chart)**:
     * Endpoint: `GET /api/dashboard/conditions`.
     * Breakdown of patient conditions with legend and percentage tooltips.
* **Resilience & Chart Performance**:
  * All charts dynamically imported (`ssr: false`) to avoid SSR hydration mismatches.
  * Wrapped in `ResponsiveContainer` with responsive axis truncation to prevent overflow at 360px.
  * Colors bound to semantic chart tokens (`--chart-1` through `--chart-5`).

---

## 3. Design System & Theme Specifications ("Clean Clinical")

* **Visual Identity**: Calm, trustworthy healthcare aesthetic. Deep teal sidebar chrome, slate surface neutrals, clear typographic hierarchy.
* **Tokens**:
  * `background`: `#F6F8FA`
  * `surface`: `#FFFFFF`
  * `surface-muted`: `#EEF2F6`
  * `border`: `#E2E8F0`
  * `foreground`: `#0F172A`
  * `muted-foreground`: `#475569`
  * `primary`: `#0F766E`
  * `primary-hover`: `#115E59`
  * `accent`: `#E6F6F4`
  * `sidebar`: `#0F2A33`
  * `success`: `#15803D`
  * `warning`: `#B45309`
  * `danger`: `#B91C1C`
  * `chart-1` to `chart-5`: `#0F766E`, `#4F46E5`, `#D97706`, `#DB2777`, `#64748B`
* **Typography**: Inter (via `next/font/google`), weights 400, 500, 600, 700.
* **Component Architecture**:
  * No direct hex values or raw Tailwind colors (`text-blue-500`) allowed in component files.
  * Every component consumes CSS variable semantic tokens (`bg-background`, `text-primary`, `border-border`, etc.).
  * Strict WCAG AA contrast compliance across all text/background combinations.

---

## 4. UI States & Experience Guarantees (The 4-State Rule)
Every data view and interactive panel MUST implement 4 distinct states:
1. **Loading State**: Customized skeleton screens mirroring layout structure (never generic spinners).
2. **Empty State**: Friendly illustration/icon, clear explanation, and primary call-to-action button (e.g., "Add First Doctor").
3. **Error State**: Non-blocking alert or card displaying clean error message with a "Retry" button.
4. **Success State**: Polished data view with smooth transitions.

**Cold-Start UX**:
* If any API request takes longer than 3 seconds (due to free-tier backend spin-up), a gentle toast/banner notifies: *"Waking up the server (this can take up to a minute on free tier)..."*.

---

## 5. Non-Functional & Quality Standards
* **Responsiveness**: Strict testing at 360px, 768px, 1024px, and 1440px. Zero horizontal scrolling.
* **Touch Targets**: Minimum 40px touch targets for mobile usability.
* **Mobile Inputs**: Form inputs set to 16px font size to prevent mobile browser auto-zoom.
* **Performance**: Server components by default; client components strictly where hooks/state are required.
* **Code Cleanliness**: Strict TypeScript (`noImplicitAny`, zero `any`), ESLint clean, zero console warnings/errors.
