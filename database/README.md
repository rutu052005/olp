# Database Notes

The schema uses PostgreSQL with normalized LMS entities.

ER relationship summary:

- `users` stores both students and admins using the `role` column.
- `courses` has many `modules`.
- `modules` has many `lessons`.
- `users` enroll in many `courses` through `enrollments`.
- `progress` links a user to course, module, and lesson completion records.
- `courses` has many `assessments`.
- `assessments` has many `questions`; `questions` has many `options`.
- `assessment_attempts` stores each student's score and pass/fail status.
- `certificates` links a completed student-course pair to a verifiable certificate ID.
- `payments` records course purchase transactions.

Run:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```
