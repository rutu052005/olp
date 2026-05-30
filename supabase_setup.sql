DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS assessment_attempts CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  slug VARCHAR(240) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  level VARCHAR(40) NOT NULL CHECK (level IN ('School', 'Diploma', 'Degree', 'Masters')),
  difficulty VARCHAR(40) NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  instructor_name VARCHAR(120) NOT NULL,
  duration_hours NUMERIC(6,2) NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  outcomes TEXT[] DEFAULT '{}'::TEXT[],
  language VARCHAR(40) DEFAULT 'English',
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE modules (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  description TEXT,
  module_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, module_order)
);

CREATE TABLE lessons (
  id BIGSERIAL PRIMARY KEY,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  description TEXT,
  video_url TEXT,
  resource_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  lesson_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, lesson_order)
);

CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

CREATE TABLE progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE assessments (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  description TEXT,
  total_marks INTEGER NOT NULL,
  passing_marks INTEGER NOT NULL,
  time_limit_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(30) NOT NULL DEFAULT 'MCQ',
  marks INTEGER NOT NULL DEFAULT 1,
  question_order INTEGER NOT NULL,
  UNIQUE (assessment_id, question_order)
);

CREATE TABLE options (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE assessment_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('passed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE TABLE certificates (
  id BIGSERIAL PRIMARY KEY,
  certificate_id VARCHAR(80) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  certificate_url TEXT,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'revoked')),
  UNIQUE (user_id, course_id)
);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_status VARCHAR(30) NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method VARCHAR(40) NOT NULL,
  transaction_id VARCHAR(120) NOT NULL UNIQUE,
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_courses_category_level ON courses(category, level);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_progress_user_course ON progress(user_id, course_id);
CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_questions_assessment ON questions(assessment_id);
CREATE INDEX idx_attempts_user_assessment ON assessment_attempts(user_id, assessment_id);
CREATE INDEX idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX idx_payments_user_course ON payments(user_id, course_id);

CREATE TABLE student_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_student_notes_user_lesson ON student_notes(user_id, lesson_id);



INSERT INTO users (id, name, email, password_hash, role, avatar_url, status) VALUES
(1, 'Aarav Mehta', 'student@learnsphere.edu', '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea', 'student', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', 'active'),
(2, 'Dr. Kavya Rao', 'admin@learnsphere.edu', '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea', 'admin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', 'active'),
(3, 'Saanvi Kapoor', 'saanvi@example.edu', '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea', 'student', NULL, 'active'),
(4, 'Vivaan Reddy', 'vivaan@example.edu', '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea', 'student', NULL, 'active'),
(5, 'Diya Menon', 'diya@example.edu', '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea', 'student', NULL, 'inactive'),
(6, 'Kabir Singh', 'kabir@example.edu', '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea', 'student', NULL, 'active'),
(7, 'Prof. Nikhil Verma', 'nikhil.admin@example.edu', '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea', 'admin', NULL, 'active');

INSERT INTO courses (id, title, slug, description, category, level, difficulty, price, thumbnail_url, instructor_name, duration_hours, rating, outcomes, language, status) VALUES
(1, 'Full-Stack Web Development Masterclass', 'full-stack-web-development-masterclass', 'React, Node.js, REST APIs, PostgreSQL, authentication, deployment, and testing.', 'Development', 'Degree', 'Intermediate', 149, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80', 'Rohan Iyer', 48, 4.90, '{"Build responsive interfaces", "REST API architecture", "PostgreSQL database design"}', 'English', 'published'),
(2, 'Python Programming from Basics to Projects', 'python-programming-basics-projects', 'Python syntax, automation, APIs, OOP, and practical projects.', 'Programming', 'School', 'Beginner', 79, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1100&q=80', 'Meera Nair', 36, 4.80, '{"Master core Python syntax", "Create automation scripts", "Understand OOP principles"}', 'English', 'published'),
(3, 'Data Structures and Algorithms', 'data-structures-algorithms', 'Arrays, linked lists, trees, graphs, recursion, sorting, searching, and DP.', 'Computer Science', 'Degree', 'Advanced', 129, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1100&q=80', 'Aditya Sharma', 52, 4.70, '{"Optimize code performance", "Implement search algorithms", "Solve complex recursion models"}', 'English', 'published'),
(4, 'Machine Learning with Real Projects', 'machine-learning-real-projects', 'Train, evaluate, and deploy practical ML models.', 'Data Science', 'Masters', 'Advanced', 199, 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1100&q=80', 'Dr. Ishita Sen', 60, 4.90, '{"Build custom ML models", "Deploy models to cloud", "Understand neural networks"}', 'English', 'published'),
(5, 'Database Management Systems', 'database-management-systems', 'Relational design, normalization, transactions, SQL queries, indexing, and ER models.', 'Computer Science', 'Diploma', 'Intermediate', 99, 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1100&q=80', 'Nikhil Verma', 40, 4.60, '{"Design normalized schemas", "Write complex SQL joins", "Understand database indexing"}', 'English', 'published'),
(6, 'Mathematics for Computing', 'mathematics-for-computing', 'Discrete math, linear algebra, probability, calculus, and mathematical reasoning.', 'Mathematics', 'School', 'Beginner', 69, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1100&q=80', 'Priya Kulkarni', 34, 4.70, '{"Apply discrete mathematics", "Solve linear algebra equations", "Analyze statistical models"}', 'English', 'published'),
(7, 'Cloud Computing and DevOps', 'cloud-computing-devops', 'Cloud fundamentals, containers, CI/CD, monitoring, and deployment strategies.', 'Cloud', 'Masters', 'Intermediate', 179, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1100&q=80', 'Samar Khan', 45, 4.80, '{"Configure CI/CD pipelines", "Manage Docker containers", "Deploy to AWS/GCP cloud"}', 'English', 'published'),
(8, 'Cyber Security Essentials', 'cyber-security-essentials', 'Network security, web vulnerabilities, cryptography, and secure coding.', 'Security', 'Diploma', 'Intermediate', 119, 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1100&q=80', 'Ananya Bose', 42, 4.80, '{"Identify OWASP top threats", "Apply encryption methods", "Build secure API backends"}', 'English', 'published');

INSERT INTO modules (id, course_id, title, description, module_order) VALUES
(1, 1, 'Web Foundations', 'HTML, CSS, JavaScript, React setup.', 1),
(2, 1, 'Backend APIs', 'Express, REST, auth, and validation.', 2),
(3, 2, 'Python Basics', 'Syntax, types, functions, and modules.', 1),
(4, 3, 'Linear Data Structures', 'Arrays, stacks, queues, and linked lists.', 1),
(5, 4, 'ML Foundations', 'Data preparation and model training.', 1),
(6, 5, 'Relational Modeling', 'ER diagrams, keys, and normalization.', 1),
(7, 7, 'Cloud Deployment', 'Containers, CI/CD, monitoring.', 1),
(8, 8, 'Secure Web Apps', 'Threats, OWASP, secure coding.', 1),
(9, 6, 'Discrete Mathematics', 'Sets, logic, proofs, and graphs.', 1);

INSERT INTO lessons (id, module_id, title, description, video_url, resource_url, duration_minutes, lesson_order) VALUES
-- Course 1: Full-Stack Web Development Masterclass (id: 1)
-- Module 1: Web Foundations (id: 1)
(1, 1, 'Course orientation', 'Platform and project overview.', 'https://www.youtube.com/watch?v=UrsmFxEIp5k', 'https://example.com/resources/web-1.pdf', 12, 1),
(2, 1, 'React component architecture', 'Reusable components and state.', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 'https://example.com/resources/web-2.pdf', 32, 2),
-- Module 2: Backend APIs (id: 2)
(3, 2, 'REST API design', 'Endpoints, status codes, and services.', 'https://www.youtube.com/watch?v=lsMQRaeKNDk', 'https://example.com/resources/api-1.pdf', 35, 1),
(4, 2, 'Express middleware & Routing', 'Authentication and validation flow.', 'https://www.youtube.com/watch?v=qz0aGYMCip0', 'https://example.com/resources/api-2.pdf', 28, 2),
-- Course 2: Python Programming from Basics to Projects (id: 2)
-- Module 3: Python Basics (id: 3)
(5, 3, 'Python syntax essentials', 'Variables, loops, and functions.', 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', 'https://example.com/resources/python-1.pdf', 28, 1),
(6, 3, 'Python Object-Oriented Programming', 'Classes, objects, inheritance.', 'https://www.youtube.com/watch?v=WOwi0h_-6n0', 'https://example.com/resources/python-2.pdf', 34, 2),
-- Course 3: Data Structures and Algorithms (id: 3)
-- Module 4: Linear Data Structures (id: 4)
(7, 4, 'Arrays and linked lists', 'Core operations and complexity.', 'https://www.youtube.com/watch?v=RBSGKlAxfok', 'https://example.com/resources/dsa-1.pdf', 40, 1),
(8, 4, 'Stacks, Queues & Hash Tables', 'Linear structures & search hashing.', 'https://www.youtube.com/watch?v=wjI1GEHyIAg', 'https://example.com/resources/dsa-2.pdf', 35, 2),
-- Course 4: Machine Learning with Real Projects (id: 4)
-- Module 5: ML Foundations (id: 5)
(9, 5, 'Train/test split', 'Model evaluation workflows.', 'https://www.youtube.com/embed/kz184QIO4ZQ?si=q7XAvZ26UV5IQ--W', 'https://docs.google.com/presentation/d/1ps8NQn5tJQSSULz6ypvzQx1Hl6ypKbCo/edit?slide=id.p5#slide=id.p5', 30, 1),
(10, 5, 'Supervised vs Unsupervised learning', 'Regression models & K-means.', 'https://www.youtube.com/embed/kz184QIO4ZQ?si=q7XAvZ26UV5IQ--W', 'https://docs.google.com/presentation/d/1ps8NQn5tJQSSULz6ypvzQx1Hl6ypKbCo/edit?slide=id.p5#slide=id.p5', 45, 2),
-- Course 5: Database Management Systems (id: 5)
-- Module 6: Relational Modeling (id: 6)
(11, 6, 'Normalization', '1NF, 2NF, 3NF with examples.', 'https://www.youtube.com/watch?v=HXV3zeQKqGY', 'https://example.com/resources/dbms-1.pdf', 34, 1),
(12, 6, 'SQL joins & Query planning', 'Inner, outer joins and query indexing.', 'https://www.youtube.com/watch?v=UrsmFxEIp5k', 'https://example.com/resources/dbms-2.pdf', 38, 2),
-- Course 6: Mathematics for Computing (id: 6)
-- Module 9: Discrete Mathematics (id: 9)
(13, 9, 'Sets and Boolean Logic', 'Set notation, Venn diagrams, truth tables.', 'https://www.youtube.com/watch?v=t89KOSmG6U4', 'https://example.com/resources/math-1.pdf', 32, 1),
(14, 9, 'Linear Algebra & Matrices', 'Vectors, matrix multiplications, dot products.', 'https://www.youtube.com/watch?v=lV8S5z8G2H8', 'https://example.com/resources/math-2.pdf', 38, 2),
-- Course 7: Cloud Computing and DevOps (id: 7)
-- Module 7: Cloud Deployment (id: 7)
(15, 7, 'Introduction to Docker', 'Creating Dockerfiles and docker-compose.', 'https://www.youtube.com/watch?v=ENrzD9HAZK4', 'https://example.com/resources/cloud-1.pdf', 45, 1),
(16, 7, 'CI/CD with GitHub Actions', 'Automated testing and cloud deployment.', 'https://www.youtube.com/watch?v=35EQXmHKZYs', 'https://example.com/resources/cloud-2.pdf', 40, 2),
-- Course 8: Cyber Security Essentials (id: 8)
-- Module 8: Secure Web Apps (id: 8)
(17, 8, 'OWASP Top 10', 'Common vulnerabilities and defenses.', 'https://www.youtube.com/watch?v=42oYgS-wI30', 'https://example.com/resources/sec-1.pdf', 38, 1),
(18, 8, 'XSS and SQL Injection Prevention', 'Encoding output & parameterized queries.', 'https://www.youtube.com/watch?v=42oYgS-wI30', 'https://example.com/resources/sec-2.pdf', 42, 2);

INSERT INTO enrollments (user_id, course_id, status, completion_percentage, completed_at) VALUES
(1, 1, 'active', 72, NULL),
(1, 2, 'completed', 100, '2026-04-22'),
(3, 4, 'active', 88, NULL),
(4, 3, 'active', 52, NULL),
(5, 5, 'active', 31, NULL),
(6, 8, 'completed', 100, '2026-05-02');

INSERT INTO progress (user_id, course_id, module_id, lesson_id, is_completed, completed_at, time_spent_minutes) VALUES
(1, 1, 1, 1, true, '2026-05-01 10:30:00+05:30', 14),
(1, 1, 1, 2, true, '2026-05-03 12:10:00+05:30', 36),
(1, 1, 2, 3, false, NULL, 22),
(1, 2, 3, 5, true, '2026-04-20 16:00:00+05:30', 30),
(6, 8, 8, 17, true, '2026-05-01 18:45:00+05:30', 41);

INSERT INTO assessments (id, course_id, title, description, total_marks, passing_marks, time_limit_minutes) VALUES
(1, 1, 'Full-Stack Web Development Final Assessment', 'Timed MCQ assessment for web development concepts.', 100, 60, 45),
(2, 2, 'Python Programming Final Assessment', 'Timed MCQ assessment for Python basics and projects.', 100, 60, 45),
(3, 3, 'Data Structures Final Assessment', 'Timed MCQ assessment for DSA concepts.', 100, 60, 50),
(4, 4, 'Machine Learning Final Assessment', 'Timed MCQ assessment for ML workflows.', 100, 65, 60),
(5, 5, 'DBMS Final Assessment', 'Timed MCQ assessment for relational databases.', 100, 60, 45),
(6, 6, 'Mathematics Final Assessment', 'Timed MCQ assessment for computing math.', 100, 60, 45),
(7, 7, 'Cloud DevOps Final Assessment', 'Timed MCQ assessment for cloud and DevOps.', 100, 60, 50),
(8, 8, 'Cyber Security Final Assessment', 'Timed MCQ assessment for security essentials.', 100, 65, 50);

INSERT INTO questions (id, assessment_id, question_text, question_type, marks, question_order) VALUES
(1, 1, 'Which pattern best describes separating client UI from server data APIs?', 'MCQ', 10, 1),
(2, 1, 'What is the safest way to store user passwords?', 'MCQ', 10, 2),
(3, 5, 'Which SQL clause filters grouped data?', 'MCQ', 10, 1),
(4, 8, 'Which vulnerability involves injecting script into trusted pages?', 'MCQ', 10, 1);

INSERT INTO options (question_id, option_text, is_correct) VALUES
(1, 'RESTful architecture', true),
(1, 'Binary heap storage', false),
(2, 'Strong one-way hash with salt', true),
(2, 'Plain text storage', false),
(3, 'HAVING', true),
(3, 'ORDER BY', false),
(4, 'Cross-site scripting', true),
(4, 'Cache warming', false);

INSERT INTO assessment_attempts (user_id, assessment_id, score, percentage, status, started_at, submitted_at) VALUES
(1, 2, 91, 91, 'passed', '2026-04-22 10:00:00+05:30', '2026-04-22 10:31:00+05:30'),
(1, 1, 86, 86, 'passed', '2026-05-18 11:00:00+05:30', '2026-05-18 11:29:00+05:30'),
(6, 8, 93, 93, 'passed', '2026-05-02 14:00:00+05:30', '2026-05-02 14:34:00+05:30');

INSERT INTO certificates (certificate_id, user_id, course_id, issued_date, certificate_url, verification_status) VALUES
('CERT-LS-2026-001', 1, 2, '2026-04-22', 'https://example.com/certificates/CERT-LS-2026-001.pdf', 'verified'),
('CERT-LS-2026-002', 6, 8, '2026-05-02', 'https://example.com/certificates/CERT-LS-2026-002.pdf', 'verified');

INSERT INTO payments (user_id, course_id, amount, payment_status, payment_method, transaction_id, paid_at) VALUES
(1, 1, 149, 'paid', 'card', 'TXN-LS-9001', '2026-03-10 09:30:00+05:30'),
(1, 2, 79, 'paid', 'upi', 'TXN-LS-9002', '2026-03-15 17:20:00+05:30'),
(3, 4, 199, 'paid', 'card', 'TXN-LS-9003', '2026-03-18 12:00:00+05:30'),
(6, 8, 119, 'paid', 'netbanking', 'TXN-LS-9004', '2026-04-02 15:25:00+05:30');

SELECT setval('users_id_seq', 7, true);
SELECT setval('courses_id_seq', 8, true);
SELECT setval('modules_id_seq', 9, true);
SELECT setval('lessons_id_seq', 18, true);
SELECT setval('assessments_id_seq', 8, true);
SELECT setval('questions_id_seq', 4, true);
