export const users = [
  {
    id: 1,
    name: 'Aarav Mehta',
    email: 'student@learnsphere.edu',
    password_hash: '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    status: 'active',
    created_at: '2026-01-12',
  },
  {
    id: 2,
    name: 'Dr. Kavya Rao',
    email: 'admin@learnsphere.edu',
    password_hash: '$2a$10$n9qo8uLOgpjiOcQyvNIF7uE2WzTOCN761g1F0uWwJc2wZ7.H7s7ea',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    status: 'active',
    created_at: '2026-01-08',
  },
];

export const courses = [
  {
    id: 1,
    title: 'Full-Stack Web Development Masterclass',
    slug: 'full-stack-web-development-masterclass',
    description: 'Build production-grade web apps with React, Node.js, REST APIs, PostgreSQL, authentication, deployment, and testing workflows.',
    category: 'Development',
    level: 'Degree',
    difficulty: 'Intermediate',
    price: 12499,
    thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Rohan Iyer',
    duration_hours: 48,
    rating: 4.9,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/watch?v=lV8S5z8G2H8',
    outcomes: ['Design responsive React interfaces', 'Build REST APIs with secure auth', 'Model relational SQL schemas', 'Deploy a production workflow'],
  },
  {
    id: 2,
    title: 'Python Programming from Basics to Projects',
    slug: 'python-programming-basics-projects',
    description: 'Learn Python syntax, data handling, automation, APIs, OOP, and project building with clean coding practices.',
    category: 'Programming',
    level: 'School',
    difficulty: 'Beginner',
    price: 6499,
    thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Meera Nair',
    duration_hours: 36,
    rating: 4.8,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/watch?v=t89KOSmG6U4',
    outcomes: ['Write clean Python programs', 'Use modules and packages', 'Automate file workflows', 'Build API-based mini projects'],
  },
  {
    id: 3,
    title: 'Data Structures and Algorithms',
    slug: 'data-structures-algorithms',
    description: 'Master arrays, linked lists, trees, graphs, sorting, searching, recursion, dynamic programming, and complexity analysis.',
    category: 'Computer Science',
    level: 'Degree',
    difficulty: 'Advanced',
    price: 10499,
    thumbnail_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Aditya Sharma',
    duration_hours: 52,
    rating: 4.7,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/watch?v=Oe421EPjeEQ',
    outcomes: ['Analyze time complexity', 'Implement core structures', 'Solve graph problems', 'Practice interview patterns'],
  },
  {
    id: 4,
    title: 'Machine Learning with Real Projects',
    slug: 'machine-learning-real-projects',
    description: 'Train ML models, evaluate metrics, use scikit-learn workflows, prepare data, and build practical prediction systems.',
    category: 'Data Science',
    level: 'Masters',
    difficulty: 'Advanced',
    price: 16499,
    thumbnail_url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Dr. Ishita Sen',
    duration_hours: 60,
    rating: 4.9,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/embed/RBSGKlAxfok',
    outcomes: ['Prepare training datasets', 'Evaluate model quality', 'Tune algorithms', 'Ship reproducible notebooks'],
  },
  {
    id: 5,
    title: 'Database Management Systems',
    slug: 'database-management-systems',
    description: 'Understand relational design, normalization, transactions, SQL queries, indexing, ER models, and database security.',
    category: 'Computer Science',
    level: 'Diploma',
    difficulty: 'Intermediate',
    price: 7999,
    thumbnail_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Nikhil Verma',
    duration_hours: 40,
    rating: 4.6,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    outcomes: ['Create normalized schemas', 'Write optimized SQL', 'Use indexes properly', 'Explain ACID transactions'],
  },
  {
    id: 6,
    title: 'Mathematics for Computing',
    slug: 'mathematics-for-computing',
    description: 'Build foundations in discrete math, linear algebra, probability, calculus, and mathematical reasoning for computing.',
    category: 'Mathematics',
    level: 'School',
    difficulty: 'Beginner',
    price: 5499,
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Priya Kulkarni',
    duration_hours: 34,
    rating: 4.7,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    outcomes: ['Apply discrete logic', 'Use matrices and vectors', 'Understand probability', 'Solve computing math problems'],
  },
  {
    id: 7,
    title: 'Cloud Computing and DevOps',
    slug: 'cloud-computing-devops',
    description: 'Learn cloud fundamentals, containers, CI/CD, monitoring, deployment strategies, and scalable infrastructure design.',
    category: 'Cloud',
    level: 'Masters',
    difficulty: 'Intermediate',
    price: 14999,
    thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Samar Khan',
    duration_hours: 45,
    rating: 4.8,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/watch?v=lV8S5z8G2H8',
    outcomes: ['Deploy cloud services', 'Design CI/CD pipelines', 'Use containers', 'Monitor infrastructure'],
  },
  {
    id: 8,
    title: 'Cyber Security Essentials',
    slug: 'cyber-security-essentials',
    description: 'Explore network security, web vulnerabilities, risk management, cryptography basics, and secure coding principles.',
    category: 'Security',
    level: 'Diploma',
    difficulty: 'Intermediate',
    price: 9999,
    thumbnail_url: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1100&q=80',
    instructor_name: 'Ananya Bose',
    duration_hours: 42,
    rating: 4.8,
    language: 'English',
    status: 'published',
    promo_video_url: 'https://www.youtube.com/watch?v=ENrzD9HAZK4',
    outcomes: ['Identify common threats', 'Secure web inputs', 'Understand cryptography', 'Build security checklists'],
  },
];

export const lessonsByCourse = Object.fromEntries(
  courses.map((course) => [
    course.id,
    [
      {
        title: 'Module 1: Foundations',
        description: `Core concepts for ${course.title}`,
        lessons: [
          { title: 'Course orientation', duration_minutes: 12, video_url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
          { title: 'Key concepts and setup', duration_minutes: 24, video_url: 'https://www.youtube.com/watch?v=SqcY0GlETPk' },
          { title: 'Guided practice lab', duration_minutes: 36, video_url: 'https://www.youtube.com/watch?v=pKd0Rpw7O48' },
        ],
      },
      {
        title: 'Module 2: Applied Skills',
        description: 'Hands-on workflow with real-world examples',
        lessons: [
          { title: 'Implementation walkthrough', duration_minutes: 31, video_url: 'https://www.youtube.com/watch?v=L72fhGm1tfE' },
          { title: 'Case study', duration_minutes: 28, video_url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
          { title: 'Practice assignment', duration_minutes: 44, video_url: 'https://www.youtube.com/watch?v=JeznW_7DlB0' },
        ],
      },
      {
        title: 'Module 3: Assessment Readiness',
        description: 'Review, recap, and final quiz preparation',
        lessons: [
          { title: 'Concept recap', duration_minutes: 18, video_url: 'https://www.youtube.com/watch?v=8hly31xKli0' },
          { title: 'Assessment strategy', duration_minutes: 16, video_url: 'https://www.youtube.com/watch?v=RBSGKlAxfok' },
        ],
      },
    ],
  ]),
);

export const assessments = courses.map((course, index) => ({
  id: index + 1,
  course_id: course.id,
  course: course.title,
  title: `${course.title} Final Assessment`,
  description: 'Timed MCQ assessment with automatic score calculation and explanations.',
  total_marks: 100,
  passing_marks: 60,
  time_limit_minutes: 45,
}));

export const questions = {
  1: [
    {
      id: 1,
      question_text: 'Which pattern best describes separating client UI from server data APIs?',
      question_type: 'MCQ',
      marks: 10,
      options: [
        { id: 101, option_text: 'RESTful architecture', is_correct: true },
        { id: 102, option_text: 'Single table inheritance', is_correct: false },
        { id: 103, option_text: 'Binary heap storage', is_correct: false },
        { id: 104, option_text: 'Static file hashing only', is_correct: false },
      ],
    },
    {
      id: 2,
      question_text: 'What is the safest way to store user passwords?',
      question_type: 'MCQ',
      marks: 10,
      options: [
        { id: 201, option_text: 'Plain text in users table', is_correct: false },
        { id: 202, option_text: 'Reversible encryption with public key', is_correct: false },
        { id: 203, option_text: 'Strong one-way hash with salt', is_correct: true },
        { id: 204, option_text: 'Browser localStorage only', is_correct: false },
      ],
    },
    {
      id: 3,
      question_text: 'Which SQL feature improves lookup speed for frequently filtered columns?',
      question_type: 'MCQ',
      marks: 10,
      options: [
        { id: 301, option_text: 'Index', is_correct: true },
        { id: 302, option_text: 'Comment', is_correct: false },
        { id: 303, option_text: 'Alias', is_correct: false },
        { id: 304, option_text: 'Cross join', is_correct: false },
      ],
    },
  ],
};

export const students = [
  { id: 1, name: 'Aarav Mehta', email: 'student@learnsphere.edu', status: 'active', enrolled: 4, progress: 68, certificates: 2 },
  { id: 2, name: 'Saanvi Kapoor', email: 'saanvi@example.edu', status: 'active', enrolled: 3, progress: 82, certificates: 1 },
  { id: 3, name: 'Vivaan Reddy', email: 'vivaan@example.edu', status: 'active', enrolled: 5, progress: 54, certificates: 0 },
  { id: 4, name: 'Diya Menon', email: 'diya@example.edu', status: 'inactive', enrolled: 2, progress: 31, certificates: 0 },
  { id: 5, name: 'Kabir Singh', email: 'kabir@example.edu', status: 'active', enrolled: 4, progress: 76, certificates: 2 },
];

export const enrollments = [
  { id: 1, student: 'Aarav Mehta', course: 'Full-Stack Web Development Masterclass', completion_percentage: 72 },
  { id: 2, student: 'Saanvi Kapoor', course: 'Machine Learning with Real Projects', completion_percentage: 88 },
  { id: 3, student: 'Vivaan Reddy', course: 'Data Structures and Algorithms', completion_percentage: 52 },
  { id: 4, student: 'Diya Menon', course: 'Database Management Systems', completion_percentage: 31 },
  { id: 5, student: 'Kabir Singh', course: 'Cyber Security Essentials', completion_percentage: 93 },
];

export const certificates = [
  { id: 1, certificate_id: 'CERT-LS-2026-001', student: 'Aarav Mehta', course: 'Python Programming from Basics to Projects', user_id: 1, course_id: 2, issued_date: '2026-04-22', verification_status: 'verified' },
  { id: 2, certificate_id: 'CERT-LS-2026-002', student: 'Kabir Singh', course: 'Cyber Security Essentials', user_id: 5, course_id: 8, issued_date: '2026-05-02', verification_status: 'verified' },
];

export const payments = [
  { id: 1, user_id: 1, course_id: 1, amount: 12499, payment_status: 'paid', payment_method: 'card', transaction_id: 'TXN-LS-9001', paid_at: '2026-03-10' },
  { id: 2, user_id: 2, course_id: 4, amount: 16499, payment_status: 'paid', payment_method: 'upi', transaction_id: 'TXN-LS-9002', paid_at: '2026-03-18' },
];

export const assessmentAttempts = [
  { id: 1, assessment: 'Web Dev', percentage: 86, status: 'passed' },
  { id: 2, assessment: 'Python', percentage: 91, status: 'passed' },
  { id: 3, assessment: 'DBMS', percentage: 74, status: 'passed' },
  { id: 4, assessment: 'DSA', percentage: 58, status: 'failed' },
];

export const activities = [
  { title: 'Completed REST API lesson', meta: 'Full-Stack Web Development • 18 minutes ago' },
  { title: 'Passed Python assessment', meta: 'Score 91% • Yesterday' },
  { title: 'Certificate generated', meta: 'Python Programming • Apr 22, 2026' },
];

export const progressEvents = [
  { title: 'Module completed', meta: 'Web Development foundations • 42 minutes spent' },
  { title: 'Lesson marked complete', meta: 'DBMS indexing strategies • 28 minutes spent' },
  { title: 'Assessment attempt submitted', meta: 'Cyber Security Essentials • Passed' },
  { title: 'Certificate eligibility reached', meta: 'Python Programming • Verified' },
];

export const testimonials = [
  { name: 'Saanvi Kapoor', role: 'Computer Science Student', quote: 'The progress view made it obvious where to focus before assessments.', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&q=80' },
  { name: 'Prof. Nikhil Verma', role: 'Course Admin', quote: 'The admin database viewer is exactly what I need during reviews and demos.', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80' },
  { name: 'Kabir Singh', role: 'Diploma Learner', quote: 'Certificates look professional and the verification page feels trustworthy.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80' },
];

export const reports = {
  growth: [
    { month: 'Jan', students: 120 },
    { month: 'Feb', students: 170 },
    { month: 'Mar', students: 240 },
    { month: 'Apr', students: 310 },
    { month: 'May', students: 390 },
  ],
  completion: [
    { course: 'Web', rate: 82 },
    { course: 'Python', rate: 88 },
    { course: 'DSA', rate: 64 },
    { course: 'ML', rate: 71 },
    { course: 'DBMS', rate: 79 },
  ],
  assessmentPie: [
    { name: 'Passed', value: 76, color: '#0f766e' },
    { name: 'Retry', value: 18, color: '#f97316' },
    { name: 'Failed', value: 6, color: '#7c3aed' },
  ],
  performance: [
    { week: 'W1', score: 68 },
    { week: 'W2', score: 74 },
    { week: 'W3', score: 81 },
    { week: 'W4', score: 86 },
  ],
  timeSpent: [
    { week: 'W1', minutes: 210 },
    { week: 'W2', minutes: 260 },
    { week: 'W3', minutes: 190 },
    { week: 'W4', minutes: 310 },
  ],
  revenue: [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5800 },
    { month: 'Mar', revenue: 7600 },
    { month: 'Apr', revenue: 9100 },
    { month: 'May', revenue: 11800 },
  ],
};

export const adminStats = {
  students: 5,
  courses: 8,
  enrollments: 18,
  assessments: 8,
  certificates: 2,
  revenue: 723760,
};

export const databaseTables = {
  users: { columns: ['id', 'name', 'email', 'role', 'status', 'created_at'], rows: users },
  students: { columns: ['id', 'name', 'email', 'status', 'enrolled', 'progress', 'certificates'], rows: students },
  admins: { columns: ['id', 'name', 'email', 'status', 'created_at'], rows: [users[1]] },
  courses: { columns: ['id', 'title', 'category', 'level', 'difficulty', 'price', 'status'], rows: courses },
  modules: { columns: ['id', 'course_id', 'title', 'module_order', 'created_at'], rows: courses.slice(0, 5).map((c, i) => ({ id: i + 1, course_id: c.id, title: `${c.title} Foundations`, module_order: 1, created_at: '2026-01-20' })) },
  lessons: { columns: ['id', 'module_id', 'title', 'duration_minutes', 'lesson_order', 'created_at'], rows: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, module_id: Math.ceil((i + 1) / 2), title: `Lesson ${i + 1}`, duration_minutes: 18 + i * 4, lesson_order: i + 1, created_at: '2026-01-21' })) },
  enrollments: { columns: ['id', 'student', 'course', 'completion_percentage'], rows: enrollments },
  assessments: { columns: ['id', 'course', 'title', 'total_marks', 'passing_marks', 'time_limit_minutes'], rows: assessments },
  questions: { columns: ['id', 'question_text', 'question_type', 'marks'], rows: questions[1] },
  options: { columns: ['id', 'question_id', 'option_text', 'is_correct'], rows: questions[1].flatMap((q) => q.options.map((o) => ({ ...o, question_id: q.id }))) },
  assessment_attempts: { columns: ['id', 'assessment', 'percentage', 'status'], rows: assessmentAttempts },
  progress: { columns: ['id', 'title', 'meta'], rows: progressEvents.map((event, i) => ({ id: i + 1, ...event })) },
  certificates: { columns: ['id', 'certificate_id', 'student', 'course', 'issued_date', 'verification_status'], rows: certificates },
  payments: { columns: ['id', 'user_id', 'course_id', 'amount', 'payment_status', 'payment_method', 'transaction_id', 'paid_at'], rows: payments },
};
