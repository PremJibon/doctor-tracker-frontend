# API Contract (mirror of backend api-spec.md — keep in sync)

Lists: { data: T[], meta: { page, limit, total, totalPages } }
Errors: { error: { code, message, details? } }

Auth:  POST /auth/login | POST /auth/refresh | POST /auth/logout | GET /auth/me
Doctors:  POST /doctors | GET /doctors?page&limit&search&specialization&hospital&from&to&sort | GET /doctors/:id
          GET /doctors/:id/patients | POST /doctors/:id/patients | DELETE /doctors/:id/patients/:patientId
Patients: GET /patients?page&limit&search&condition&doctorId&from&to&sort | PATCH /patients/:id | DELETE /patients/:id
Dashboard: GET /dashboard/summary | /patients-per-doctor | /patients-over-time?range=7d|30d|12m | /conditions

Types live in src/types and must match these shapes exactly.
