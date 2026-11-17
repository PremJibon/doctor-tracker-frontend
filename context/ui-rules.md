# UI Rules

- Mobile-first. Tables become stacked cards below `md`. Sidebar becomes a drawer below `lg`.
- Every data view has 4 states: loading (skeleton), empty (message + action), error (retry), success.
- Destructive actions always use ConfirmDialog. Success/failure always toast.
- Forms: React Hook Form + Zod, inline field errors, disabled submit while pending.
- Search inputs debounce 400ms; changing filters resets page to 1.
- Interactive elements >= 40px tall, visible focus ring, keyboard accessible, labelled icons.
- Spacing and layout use consistent page container + PageHeader.
- Reuse components from ui-registry.md; do not create near-duplicates.
- Charts: responsive container, readable axis labels at 375px, tooltips, token-based colors, accessible title.
