# Architecture

## Stack
Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, TanStack Query,
React Hook Form + Zod, Recharts, Axios, lucide-react, sonner.

## Structure
src/
  app/                (routes) login/, (protected)/dashboard|doctors|patients
  components/ui/      shadcn primitives
  components/shared/  DataTable, Pagination, SearchInput, FilterBar, ConfirmDialog, EmptyState, StatCard, PageHeader
  features/{auth,doctors,patients,dashboard}/  api.ts, hooks.ts, schemas.ts, components/
  lib/                axios client (refresh interceptor), utils, query client
  types/

## Data flow
Component -> feature hook (TanStack Query) -> feature api.ts -> axios client -> Express API.
Mutations invalidate related query keys. URL params are the source of truth for list state.

## Auth flow
Login returns access token (kept IN MEMORY only). Refresh token is an httpOnly cookie
(`withCredentials: true`). On 401: call /auth/refresh once, retry, else redirect /login.
Protected layout checks session (via /auth/me or refresh) before rendering children.

## Server vs Client Components
Server by default. Client only for interactivity (forms, tables with state, charts).
Dynamic-import chart components.

## Env
NEXT_PUBLIC_API_URL (e.g. http://localhost:5000/api). Backend may cold-start on free tier:
show an explicit "waking up the server" loading state if a request exceeds ~3s.
