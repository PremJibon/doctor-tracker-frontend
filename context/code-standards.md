# Code Standards

- TypeScript strict, no `any`. Zod schemas export inferred types.
- Query keys centralised per feature (e.g. `doctorKeys.list(params)`).
- Use `keepPreviousData` for paginated lists to avoid flicker.
- Memoize only where measured useful; avoid prop drilling; split components by responsibility.
- No data fetching inside presentational components; use feature hooks.
- Handle API error shape in one place (axios interceptor + `getErrorMessage`).
- Accessible by default (labels, aria, focus management in dialogs).
- Small commits (feat:, fix:, chore:, docs:). Lint and typecheck before marking done.
