# UI Registry (Updated via /imprint pattern capture)

| Component | Path | Purpose | Props summary | Used in |
| :--- | :--- | :--- | :--- | :--- |
| `Button` | `src/components/ui/button.tsx` | Accessible action trigger with Clean Clinical variants | `variant: default \| destructive \| outline \| secondary \| ghost \| link`, `size: default \| sm \| lg \| icon` | `LoginForm`, `Header`, `Sidebar`, modals |
| `Input` | `src/components/ui/input.tsx` | Form input with 16px text (mobile auto-zoom prevention) and error ring | `error?: boolean`, standard input attributes | `LoginForm`, search bars, dialog forms |
| `Card` | `src/components/ui/card.tsx` | Surface card container with header, title, description, and footer | `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `LoginForm`, dashboard widgets, doctor cards |
| `Badge` | `src/components/ui/badge.tsx` | Status and category pill badge | `variant: default \| secondary \| accent \| destructive \| warning \| success \| outline` | Specialization tags, condition pills |
| `Dialog` | `src/components/ui/dialog.tsx` | Accessible modal dialog with backdrop blur and ESC handler | `open: boolean`, `onOpenChange: (open: boolean) => void` | Add Doctor, Add Patient, ConfirmDialog |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Pulsing surface-muted placeholder for loading states | standard HTML attributes | Loading states across tables and cards |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | Deep teal (#0F2A33) navigation bar (desktop persistent, mobile drawer) | `mobileOpen?: boolean`, `onMobileClose?: () => void` | Protected App Shell (`(protected)/layout.tsx`) |
| `Header` | `src/components/layout/Header.tsx` | Sticky top app bar with mobile menu toggle and live status | `onMobileMenuOpen: () => void` | Protected App Shell (`(protected)/layout.tsx`) |
| `PageHeader` | `src/components/shared/PageHeader.tsx` | Consistent page title, breadcrumb navigation, and action buttons | `title: string`, `description?: string`, `breadcrumbs?: BreadcrumbItem[]`, `actions?: React.ReactNode` | Dashboard, Doctors, Patients pages |
| `LoginForm` | `src/features/auth/components/LoginForm.tsx` | Clinical login card with Zod validation, demo auto-fill, and error alerts | None | `/login` page |
