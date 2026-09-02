# Backend API

All protected routes require `Authorization: Bearer <Supabase access token>`. Success uses `{ "data": ... }`; collection responses also include `meta.pagination`. Errors use `{ "error": { "code", "message" } }`. Collection defaults are `page=1&limit=25`; maximum `limit` is 100.

| Route | Methods | Role | Body/query summary |
| --- | --- | --- | --- |
| `/api/admin/students` | GET, POST | Admin | Pagination/search/status; explicit student fields |
| `/api/admin/students/:id` | GET, PATCH, DELETE | Admin | PATCH allowlist; DELETE archives |
| `/api/students`, `/api/students/:id` | GET | Admin/Teacher | RLS-assigned students; class/status/search filters |
| `/api/guardians`, `/api/guardians/:id` | GET | Admin/Teacher | RLS-assigned guardian access |
| `/api/admin/guardians`, `/api/admin/guardians/:id` | POST, PATCH | Admin | Guardian contact/preferences |
| `/api/admin/students/:id/guardians` | POST | Admin | `{ guardian_id }` |
| `/api/admin/students/:id/guardians/:guardianId` | DELETE | Admin | Removes relationship |
| `/api/students/:id/guardians` | GET | Admin/Teacher | Lists permitted relationships |
| `/api/admin/teachers` | GET, POST | Admin | POST provisions Auth/profile/teacher with compensation |
| `/api/admin/teachers/:id` | GET, PATCH | Admin | Qualification/hire metadata |
| `/api/admin/teachers/:id/classes` | GET | Admin | Teacher assignments |
| `/api/subjects` | GET | Authenticated | Pagination/search |
| `/api/admin/subjects` | POST | Admin | Name/description |
| `/api/admin/subjects/:id` | PATCH, DELETE | Admin | DELETE deactivates |
| `/api/classes`, `/api/classes/:id` | GET | Admin/Teacher | RLS-assigned class access |
| `/api/admin/classes` | POST | Admin | Class schedule/subject fields |
| `/api/admin/classes/:id` | PATCH, DELETE | Admin | DELETE deactivates |
| `/api/admin/classes/:id/students` | GET, POST | Admin | `{ student_id }` assignment |
| `/api/admin/classes/:id/students/:studentId` | DELETE | Admin | Removes assignment |
| `/api/admin/classes/:id/teachers` | GET, POST | Admin | `{ teacher_id }` assignment |
| `/api/admin/classes/:id/teachers/:teacherId` | DELETE | Admin | Removes assignment |
| `/api/attendance` | GET, POST | Admin/Teacher | class/student/date filters; assigned relationships |
| `/api/attendance/:id` | PATCH | Admin/Teacher | Status/notes |
| `/api/homework` | GET, POST | Admin/Teacher | class/search/pagination |
| `/api/homework/:id` | GET, PATCH, DELETE | Admin/Teacher | Assigned class enforced by RLS |
| `/api/homework/:id/submissions` | GET | Admin/Teacher | Submission list |
| `/api/homework/:id/submissions/:studentId` | PATCH | Admin/Teacher | Status/score/feedback |
| `/api/assessments` | GET, POST | Admin/Teacher | class/student/subject filters |
| `/api/assessments/:id` | GET, PATCH, DELETE | Admin/Teacher | Score/grade/comment fields |
| `/api/assessments/:id/results` | GET, POST | Admin/Teacher | Unique student result |
| `/api/assessments/:id/results/:studentId` | PATCH | Admin/Teacher | Score/grade/comment |
| `/api/students/:id/notes` | GET, POST | Authenticated / Teacher | Teachers see/create `Teacher + Admin` only |
| `/api/student-notes/:id` | PATCH, DELETE | Admin/Teacher | Ownership/RLS enforced |
| `/api/reports`, `/api/reports/:id` | GET/POST, GET/PATCH | Admin/Teacher | Explicit workflow transitions only |
| `/api/reports/:id/sections` | GET, POST | Admin/Teacher | Own draft/changes-requested reports |
| `/api/reports/:id/sections/:sectionId` | PATCH, DELETE | Admin/Teacher | Edit/remove sections where report workflow RLS permits |
| `/api/report-requests` | GET | Admin/Teacher | RLS class assignments |
| `/api/admin/report-requests` | POST | Admin | Weekly/Monthly request |
| `/api/reports/:id/pdf` | POST | Admin/Teacher | Generates private PDF and short signed URL |
| `/api/messages`, `/api/messages/:id` | GET/POST, GET | Admin/Teacher | Sender derived from session; recipient allowlist |
| `/api/notifications`, `/api/notifications/:id` | GET, PATCH | Admin/Teacher | Unread filter; `{ read: boolean }` |
| `/api/calendar` | GET | Admin/Teacher | Date/schedule list |
| `/api/admin/calendar`, `/api/admin/calendar/:id` | POST, PATCH/DELETE | Admin | Validated event timestamps |
| `/api/settings` | GET | Admin | Secret-like keys excluded |
| `/api/admin/settings/:key` | PATCH | Admin | Secret-like keys rejected |
| `/api/storage/upload` | POST | Admin | Multipart file plus validated bucket/path |
| `/api/storage/objects` | DELETE | Admin/Teacher | RLS plus validated bucket/path |
| `/api/storage/signed-url` | POST | Admin/Teacher | Validated private target; 30–300 seconds |

Important statuses: 400 validation, 401 missing/invalid authentication, 403 unauthorized/RLS denial, 404 invisible or missing record, 409 uniqueness/relationship conflict, and 500 sanitized internal failure. Raw database messages are never returned.

Production deployment must connect `src/server/rate-limit.ts` to a distributed rate-limit provider for teacher provisioning, messaging, provider delivery, PDF generation, and signed URLs.
