# LearnSphere LMS

A Web-Based Learning Platform for Courses, Assessments, Progress Tracking and Certification.

LearnSphere is a production-style LMS project with a premium React UI, role-based student/admin dashboards, course management screens, assessment workflows, progress tracking, certificate verification, SQL schema, seed data, and an Express REST API scaffold.

## Features

- Premium responsive landing page with animated hero, stats, categories, featured courses, benefits, and testimonials
- Student authentication UI, admin authentication UI, registration, and forgot password surface
- Student dashboard with enrolled courses, progress cards, upcoming assessments, learning streak, charts, and recent activity
- Admin dashboard with students, courses, enrollments, assessments, certificates, completion, revenue, and analytics charts
- Course catalog with search, filters, course detail pages, curriculum, reviews, enroll and continue flows
- Learning page with video player placeholder, module sidebar, notes, resources, progress, and lesson completion
- MCQ assessment system with timer UI, question navigation, submission, result page, pass/fail status, explanations, and attempt history
- Progress tracking with completion timelines, time spent, scores, and certificate eligibility signals
- Certificate module with printable premium certificate cards and verification by certificate ID
- Student management, course management, assessment management, certificate management, reports, settings
- Admin-only Database Viewer for SQL table browsing, search UI, pagination, connection status, SQL preview, and JSON response panel
- PostgreSQL schema with foreign keys, constraints, indexes, and realistic seed data
- Express REST API structure with JWT-ready protected routes and role checks

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, Axios
- Backend: Node.js, Express, JWT, PostgreSQL `pg`
- Database: PostgreSQL SQL schema and seed scripts

## Folder Structure

```text
.
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── README.md
├── server/
│   └── index.js
├── src/
│   ├── api/
│   │   └── client.js
│   ├── main.jsx
│   ├── sampleData.js
│   └── styles.css
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

Run the API server:

```bash
npm run server
```

API base URL:

```text
http://localhost:4000/api
```

## Database Setup

Create a PostgreSQL database named `learnsphere`, then run:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

On Windows PowerShell:

```powershell
psql $env:DATABASE_URL -f database/schema.sql
psql $env:DATABASE_URL -f database/seed.sql
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:4000/api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnsphere
JWT_SECRET=replace-with-a-long-random-secret
PORT=4000
```

## Demo Logins

Student:

```text
student@learnsphere.edu
password
```

Admin:

```text
admin@learnsphere.edu
password
```

The current frontend uses realistic local sample data for presentation readiness. The Express API mirrors the required endpoint structure and can serve mock data immediately; when `DATABASE_URL` is configured, the admin database endpoint can query PostgreSQL tables.

## API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Courses:

- `GET /api/courses`
- `GET /api/courses/:id`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

Enrollments:

- `POST /api/enrollments`
- `GET /api/enrollments/user/:userId`
- `PUT /api/enrollments/:id/progress`

Assessments:

- `GET /api/assessments/:courseId`
- `POST /api/assessments`
- `POST /api/assessments/:id/submit`
- `GET /api/assessment-attempts/user/:userId`

Certificates:

- `POST /api/certificates/generate`
- `GET /api/certificates/user/:userId`
- `GET /api/certificates/verify/:certificateId`

Admin:

- `GET /api/admin/stats`
- `GET /api/admin/students`
- `GET /api/admin/reports`
- `GET /api/admin/database/:tableName`

## Screenshots

Add screenshots here after running the app:

- Landing page
- Student dashboard
- Admin dashboard
- Course detail page
- Assessment page
- Certificate verification
- Database viewer

## Future Scope

- Replace mock frontend data with live API calls across all screens
- Add migrations with Prisma, Drizzle, or Knex
- Add file uploads for thumbnails, videos, resources, and certificate PDFs
- Add payment gateway integration
- Add email notifications and password reset tokens
- Add audit logs and admin activity history
- Add automated tests and CI pipeline
