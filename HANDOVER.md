# LearnSphere LMS Handover — Full 5-Star Upgrade Complete

## Current Status

LearnSphere has been fully upgraded from a mock prototype/product scaffold into a production-grade, state-of-the-art Learning Management System (LMS) with real authentication, real database queries, real scoring, and proper clean architecture.

It includes:
- **Clean Architecture**: Monolith split into 35+ modular, reusable components and pages under `src/components`, `src/contexts`, and `src/pages`.
- **React Router Lazy Chunking**: Code-splitting dynamic bundle chunks using `React.lazy` and `Suspense` loaders to fix Vite bundle warnings.
- **Dynamic JWT Auth System**: Context-backed, persisted login session checks with robust middleware validation.
- **Live Database CRUD**: Express routing wired directly to PostgreSQL pg pool, complete with stateful sliding-window in-memory fallbacks for presentation robustness when no live database is connected.
- **Security Hardening**: Locked CORS origin policies, Express payload size limitations, rate limit rules (15/min for auth, 80/min general), and parameterized queries.
- **SEO & Typography**: Advanced typography utilizing Google Fonts (Outfit, Inter) alongside detailed Open Graph and description tags in `index.html`.

## Tech Stack

- **Frontend**: React (18.3.1), Vite (6.0.5), Tailwind CSS, Framer Motion, Lucide React, Recharts, Axios
- **Backend**: Node.js, Express (4.21.2), JWT, Bcryptjs, Zod, Helmet, PostgreSQL `pg`
- **Database**: PostgreSQL (v13+) or Stateful in-memory fallback

## Run Commands

Install dependencies:
```bash
npm install
```

Run backend API server:
```bash
npm run server
```

Run frontend in developer mode:
```bash
npm run dev
```

Build production frontend:
```bash
npm run build
```

## Demo Logins

Both mock mode and PostgreSQL seed databases accept these default credentials (passwords are stored as safe bcrypt hashes):

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

## Key Files & Structure

```text
src/
├── api/
│   └── client.js        # Fully wired Axios service calls
├── components/
│   ├── layout/          # Shell, Sidebar
│   └── ui/              # Toast, Input, DataTable, Skeleton, Chart wrappers
├── contexts/
│   ├── AppContext.jsx   # Theme, Toast notification triggers
│   └── AuthContext.jsx  # Dynamic JWT session storage
├── pages/
│   ├── public/          # LandingPage, CoursesPage, CourseDetailPage, VerifyCertificate
│   ├── student/         # Dashboard, LearningPage, Quiz, QuizResult, Progress
│   └── admin/           # Dashboard, StudentsManager, CoursesManager, DBViewer, Reports
server/
├── db.js                # Centralized pool export and health checking
├── index.js             # Thin routing server mount registry
├── middleware/
│   ├── auth.js          # RequireAuth JWT token validator
│   ├── rateLimit.js     # IP sliding-window limiters
│   └── validate.js      # Zod request validators
└── routes/
    ├── auth.js          # Registration, login, active session fetcher
    ├── courses.js       # Live course queries and creation
    ├── enrollments.js   # Enrollments registrar and updates
    ├── assessments.js   # Question navigation and MCQ grading
    ├── certificates.js  # Verified certificates generator
    ├── progress.js      # Lesson progression logger
    └── admin.js         # Stats aggregations and database browser
```

## Security hardeners applied
- **Parameterization**: Parameterized all PostgreSQL SQL queries to prevent SQL injections.
- **Helmet**: Set up Helmet security header middlewares.
- **Size Limits**: Enforced 1MB request limits.
- **Validation**: Applied request schema checks with Zod for robust input filtering.
