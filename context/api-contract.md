# API Contract (mirror of backend api-spec.md — keep in sync)

Base: /api (Axios client prefixes baseURL)
Auth: Bearer access token on everything except login, refresh, health.

## Standard Envelopes
- Lists: `{ data: T[], meta: { page, limit, total, totalPages } }`
- Errors: `{ error: { code: string, message: string, details?: any[] } }`
- Health: `{ status: "ok" }`

## Endpoints

### Health
- `GET /health` (or `/api/health`) -> `{ status: "ok" }`

### Auth
- `POST /auth/login` -> body: `{ email, password }` -> `{ accessToken, user }` (plus sets httpOnly `refreshToken` cookie, path `/api/auth`)
- `POST /auth/refresh` -> (uses httpOnly `refreshToken` cookie) -> `{ accessToken }`
- `POST /auth/logout` -> clears httpOnly `refreshToken` cookie
- `GET /auth/me` -> `{ user }`

### Doctors
- `POST /doctors` -> body: `{ name, specialization, hospital, phone, email }`
- `POST /doctors/bulk-delete` -> body: `{ ids: string[], cascade?: boolean }` -> `{ data: { requested: number, deleted: number, deletedPatients: number, skipped: Array<{ id: string, name: string, patientCount: number, reason: string }>, notFound: string[] } }`
- `GET /doctors` -> query: `?page&limit&search&specialization&hospital&from&to&sort`
- `GET /doctors/:id` -> `{ doctor: Doctor }`
- `GET /doctors/:id/patients` -> query: `?page&limit&search` -> `{ data: Patient[], meta }`
- `POST /doctors/:id/patients` -> body: `{ name, age, gender, phone, condition, admittedAt }`
- `DELETE /doctors/:id/patients/:patientId` -> `{ data: { message: string } }`

### Patients
- `GET /patients` -> query: `?page&limit&search&condition&doctorId&from&to&sort` -> `{ data: Patient[], meta }`
- `POST /patients/bulk-delete` -> body: `{ ids: string[] }` -> `{ data: { requested: number, deleted: number, notFound: string[] } }`
- `PATCH /patients/:id` -> body: partial Patient fields
- `DELETE /patients/:id` -> `{ data: { message: string } }`

### Dashboard
- `GET /dashboard/summary` -> `{ data: { totalDoctors: number, totalPatients: number, avgPatientsPerDoctor: number, admissionsLast30d: number, admissionsPrev30d: number, newDoctorsLast30d: number } }`
- `GET /dashboard/patients-per-doctor` -> top 10 `Array<{ doctorId: string, name: string, count: number, specialization: string, hospital: string }>`
- `GET /dashboard/patients-over-time?range=7d|30d|12m` -> `Array<{ date: string, count: number }>`
- `GET /dashboard/conditions` -> `Array<{ condition: string, count: number }>`
- `GET /dashboard/gender` -> `Array<{ gender: string, count: number }>`
- `GET /dashboard/age-groups` -> `Array<{ ageGroup: string, count: number }>` (buckets: "0-17", "18-34", "35-49", "50-64", "65+")
- `GET /dashboard/specialties` -> top 8 `Array<{ specialization: string, doctors: number, patients: number }>`
- `GET /dashboard/hospitals` -> top 5 `Array<{ hospital: string, doctors: number, patients: number }>`
- `GET /dashboard/recent-admissions?limit=1..20` -> `Array<{ _id: string, name: string, age: number, gender: string, condition: string, admittedAt: string, doctorId: string, doctorName: string, doctorSpecialization: string }>`

Types live in `src/types` and must match these shapes exactly.
