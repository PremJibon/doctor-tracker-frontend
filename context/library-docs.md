# Library Docs (project-specific rules)

- **next**: read `node_modules/next/dist/docs/` first. Server Components by default; protected routes via layout group.
- **@tanstack/react-query**: one QueryClient provider; mutations invalidate by feature key.
- **react-hook-form + zod**: `zodResolver`; share schemas with types.
- **recharts**: wrap in ResponsiveContainer; import via `next/dynamic` (ssr:false) where needed; colors from chart tokens via CSS variables.
- **shadcn/ui**: add components via CLI; never edit tokens inline, edit globals.css.
- **axios**: single instance, `withCredentials: true`, refresh-once interceptor, attach in-memory access token.
- **sonner**: one Toaster in root layout.
Before using any library above, load its installed skill first if one exists.
