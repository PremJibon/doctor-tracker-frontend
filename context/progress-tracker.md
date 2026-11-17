# Progress Tracker (Updated after Phases 1–3)

## Current step
Step 4 — Shared Components Suite (Next Up)

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
  - Production build (`npm run build`) and lint (`npm run lint`) passed with 0 errors and 0 warnings.

## Decisions made
- Kept access token strictly in-memory; httpOnly refresh cookie handles session persistence across browser refreshes.
- Used Tailwind v4 `@theme inline` mapping to bind CSS variables directly to utility classes without hardcoded colors.
- Implemented static year in login footer to satisfy Next.js 16.4 Cache Components prerendering checks.
- Ignored `.agents` and `.agent` in `eslint.config.mjs` to keep build lint checks focused on application source code.

## Known issues / next steps
- Proceed to Step 4: Shared Components (DataTable, Pagination, SearchInput, FilterBar, ConfirmDialog, EmptyState, StatCard).
