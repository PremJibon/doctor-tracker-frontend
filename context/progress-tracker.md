# Progress Tracker (Updated after Phases 4–6)

## Current step
Step 7 — Patients Page (List, Filters, Edit Dialog, Delete)

## Completed Steps
- [x] **Step 1: Setup & Design Tokens**
  - Initialized Next.js 16.4.6 (App Router + Turbopack + TypeScript + Tailwind v4 + ESLint).
  - Defined "Clean Clinical" tokens in `globals.css` (Background `#F6F8FA`, Surface `#FFFFFF`, Surface Muted `#EEF2F6`, Border `#E2E8F0`, Text `#0F172A`, Primary `#0F766E`, Primary Hover `#115E59`, Accent `#E6F6F4`, Sidebar `#0F2A33`, Status & Chart tokens).
  - Configured Inter font via `next/font/google`.
  - Installed core libraries (`@tanstack/react-query`, `axios`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `recharts`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority`).
  - Configured Axios client with cold-start timeout (>3s notification) and `withCredentials: true`.
  - Configured TanStack Query client & root Providers with toaster and cold-start alert.
  - Verified `node_modules/next/dist/docs/`.
  - Created `.env.example`.

- [x] **Step 2: Authentication & Route Guarding**
  - In-memory access token storage module (`src/lib/auth-token.ts`) ensuring zero localStorage/XSS exposure.
  - Axios 401 response interceptor with request queue and automatic refresh against `/api/auth/refresh`.
  - Zod validation schema for login credentials (`src/features/auth/schemas.ts`).
  - Login page (`/login`) with responsive `LoginForm` featuring email/password inputs, demo credential auto-fill, and error messaging.
  - Protected layout (`src/app/(protected)/layout.tsx`) verifying session state via `useCurrentUser()` before rendering protected routes.
  - Logout mutation clearing in-memory token and triggering `/api/auth/logout`.

- [x] **Step 3: App Shell & Responsive Layout**
  - Persistent deep teal (`#0F2A33`) sidebar on `lg+` viewports.
  - Slide-over mobile drawer with backdrop blur and touch targets on `<lg`.
  - Top header with mobile hamburger button, live API connectivity badge, and user preview.
  - Reusable `PageHeader` with title, optional description, breadcrumbs, and actions slot.
  - UI Registry updated via `/imprint` methodology (`context/ui-registry.md`).

- [x] **Step 4: Shared Components Suite**
  - `SearchInput`: URL search param synchronization, 400ms debounce, pending transition indicator, clear button, and automatic page param reset.
  - `Pagination`: Accessible page navigator with smart ellipsis windowing, total records count summary, mobile compact buttons, and automatic hiding on single page datasets.
  - `FilterBar`: Dual-mode responsive filtering: horizontal flex layout on desktop (`md+`) and sliding drawer modal with touch triggers on mobile (`<md`), active filter chips with individual removal, and global reset trigger.
  - `ConfirmDialog`: Accessible confirmation dialog with warning icon, asynchronous pending button state, and customizable copy for destructive operations.
  - `EmptyState`: Dashed border container with icon wrapper, title, description, and optional action CTA button.
  - `StatCard`: Clinical KPI card featuring uppercase title, bold quantitative value, accent icon container, trend percentage badge with TrendingUp/TrendingDown icons, and skeleton loading state.
  - `DataTable`: Generic typed table component supporting responsive desktop `<table>` and mobile card stack via `mobileCardRenderer`, built-in loading skeleton rows/cards, empty state fallback, and interactive row click handling.

- [x] **Step 5: Doctors Feature & Listing**
  - Doctors listing page (`/doctors`) with URL search parameter persistence (`search`, `specialization`, `hospital`, `from`, `to`, `sort`, `page`).
  - TanStack Query hooks (`useDoctors`, `useCreateDoctorMutation`) with query key factories and cache invalidation.
  - Desktop `DataTable` with sortable columns, specialization badges, and view profile actions.
  - Mobile card stack renderer displaying touch targets, contact details, and doctor metadata.
  - FilterBar integration with search, specialty filter, hospital filter, sort options, and date range filters with active filter pill chips.
  - `CreateDoctorDialog` with React Hook Form + Zod schema validation, recommended specialty quick-select pills, phone validation, and mutation handling.

- [x] **Step 6: Doctor Detail & Patient Sub-Management**
  - Dynamic doctor detail route (`/doctors/[id]`) with breadcrumbs and back navigation.
  - Doctor profile summary card featuring contact info, specialty badge, hospital, and creation date.
  - Sub-patients data table with independent search and pagination (`patientPage`, `patientSearch`).
  - `AddDoctorPatientDialog` for assigning new patients directly to the doctor with instant cache invalidation of doctor detail and patient queries.
  - Patient deletion flow using `ConfirmDialog` and `useRemoveDoctorPatientMutation` with Sonner toast feedback.

## Decisions made
- Kept access token strictly in-memory; httpOnly refresh cookie handles session persistence across browser refreshes.
- Used Tailwind v4 `@theme inline` mapping to bind CSS variables directly to utility classes without hardcoded colors.
- Implemented static year in login footer to satisfy Next.js 16.4 Cache Components prerendering checks.
- URL state synchronization using Next.js `useRouter`, `usePathname`, and `useSearchParams` wrapped inside React `useTransition` and `{ scroll: false }` to avoid jarring page scrolls or UI jumps.
- Resetting pagination param (`page`) to 1 whenever any filter or search term changes, preventing "empty page" bugs where a high page number has no results.
- Dual-mode data presentation: Data tables automatically render a semantic desktop table (`md+`) and a responsive card stack (`<md`) via `mobileCardRenderer` to ensure optimal usability on mobile devices without horizontal overflow.
- Dialog state management: Supported both controlled and uncontrolled patterns for dialogs (`open` + `onOpenChange` or independent trigger button).
- Form validation backed by strict Zod schemas with phone number formatting, age constraints, and sanitized strings.

## Current verification status
- TypeScript compilation: `npm run build` completed with 0 errors.
- Next.js Turbopack build: All routes successfully compiled and prerendered (Static `/dashboard`, `/doctors`, `/login`, `/patients`, Partial Prerender `/doctors/[id]`).
- ESLint checks: `npm run lint` clean pass with 0 errors and 0 warnings.

## Next steps
- Proceed to Step 7: Patients page (full patient list, filters, edit dialog, delete).
