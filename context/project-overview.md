# Project Overview

**Doctor Tracker Web** — modern admin UI to manage doctors and patients with a visual
analytics dashboard. Consumes a separate Express REST API. Built for the Care Guide BD
full-stack assessment (graded on UX/UI, data viz, performance, Next.js best practices).

## Pages
/login, /dashboard, /doctors, /doctors/[id], /patients  (all but /login protected)

## Must-have UX
Clean layout, clear hierarchy, responsive 360px -> wide desktop, smooth navigation,
loading skeletons, empty and error states, confirmation before destructive actions, toasts.

## Out of scope
Roles, i18n, file upload, realtime.

## Success criteria
Logged-out users cannot reach protected pages; all CRUD flows work against the live API;
no console errors; looks great at 375 / 768 / 1440 px.
