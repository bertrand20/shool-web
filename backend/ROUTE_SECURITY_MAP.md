# API Route Security Map

## Public

- `GET /api/public/school-info`
- `GET /api/public/news`
- `GET /api/public/events`
- `GET /api/public/gallery`
- `GET /api/public/academics`
- `GET /api/public/admissions`
- `GET /api/public/student-life`
- `GET /api/public/achievements`
- `GET /api/public/staff`
- `GET /api/public/alumni`
- `GET /api/portal/announcements`
- `GET /api/portal/gallery`
- `GET /api/portal/school-info`
- `GET /api/portal/events`
- `GET /api/portal/homework`
- `POST /api/portal/contact` (rate limited and validated)
- `POST /api/portal/register` (rate limited; creates an admission application only)

Public responses are restricted to published content fields. No student, parent, finance, health, payroll, attendance, or authentication data belongs in this namespace.

## Authentication

- `POST /api/admin/login` (rate limited)
- `POST /api/admin/forgot-password` (rate limited)
- `POST /api/admin/reset-password`
- `POST /api/admin/change-password` (authenticated)

## Role permissions

- `SUPER_ADMIN`: full access
- `SCHOOL_ADMIN`: general school operations, content, reports, and audit access
- `ACADEMIC_ADMIN`: academic, attendance, and student read access
- `FINANCE_ADMIN`: fees, payments, and finance reports
- `HR_ADMIN`: staff, payroll, leave, and HR operations
- `CONTENT_EDITOR`: public content only
- `TEACHER`: limited student, attendance, and academic access

## Protected operational groups

All routes below `/api/students`, `/api/parents`, `/api/attendance`, `/api/fees`, `/api/payments`, `/api/outstanding`, `/api/revenue`, `/api/staff`, `/api/subjects`, `/api/exams`, `/api/marks`, `/api/report-card`, `/api/timetable`, `/api/homework`, `/api/notifications`, `/api/reports`, `/api/library`, `/api/transport`, `/api/health`, `/api/payroll`, `/api/leave`, `/api/events`, `/api/behavior`, `/api/inventory`, `/api/audit-logs`, and `/api/certificates` require a valid database-backed admin identity and a role permission. Writes require the corresponding `*:write` permission.

Sensitive portal lookups for student search, fees, payments, and report cards require authentication and permission; predictable student IDs are not public authorization.

## Contact messages

- `GET /api/admin/contact-messages` (`content:read`)
- `PATCH /api/admin/contact-messages/:id` (`SUPER_ADMIN` or `SCHOOL_ADMIN`)

Admission submissions are stored in `admission_applications` and are not inserted into the private `students` or `parents` tables by the public endpoint.
