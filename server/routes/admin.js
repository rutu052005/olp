import express from 'express';
import { query, pool } from '../db.js';
import { databaseTables, reports } from '../../src/sampleData.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const isDbActive = async () => {
  if (!pool) return false;
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

// GET /api/admin/stats - Aggregated counts and revenue
router.get('/stats', requireAuth(['admin']), async (req, res, next) => {
  try {
    const dbActive = await isDbActive();
    if (dbActive) {
      const studentsRes = await query("SELECT COUNT(*) FROM users WHERE role = 'student'");
      const coursesRes = await query("SELECT COUNT(*) FROM courses WHERE status != 'archived'");
      const enrollmentsRes = await query("SELECT COUNT(*) FROM enrollments");
      const assessmentsRes = await query("SELECT COUNT(*) FROM assessments");
      const certificatesRes = await query("SELECT COUNT(*) FROM certificates");
      const revenueRes = await query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = 'paid'");

      return res.json({
        students: Number(studentsRes.rows[0].count),
        courses: Number(coursesRes.rows[0].count),
        enrollments: Number(enrollmentsRes.rows[0].count),
        assessments: Number(assessmentsRes.rows[0].count),
        certificates: Number(certificatesRes.rows[0].count),
        revenue: Number(revenueRes.rows[0].total)
      });
    } else {
      // Mock mode
      const studentsCount = databaseTables.users.rows.filter(u => u.role === 'student').length;
      const coursesCount = databaseTables.courses.rows.filter(c => c.status !== 'archived').length;
      const enrollmentsCount = databaseTables.enrollments.rows.length;
      const assessmentsCount = databaseTables.assessments.rows.length;
      const certificatesCount = databaseTables.certificates.rows.length;
      const revenue = databaseTables.payments?.rows?.reduce((sum, p) => sum + (p.payment_status === 'paid' ? Number(p.amount) : 0), 0) || 8720;

      return res.json({
        students: studentsCount,
        courses: coursesCount,
        enrollments: enrollmentsCount,
        assessments: assessmentsCount,
        certificates: certificatesCount,
        revenue
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/students - List all student profiles with metrics
router.get('/students', requireAuth(['admin']), async (req, res, next) => {
  try {
    const dbActive = await isDbActive();
    if (dbActive) {
      const dbRes = await query(
        `SELECT u.id, u.name, u.email, u.status, u.created_at,
                COUNT(DISTINCT e.id) as enrolled,
                COALESCE(AVG(e.completion_percentage), 0)::numeric(5,2) as progress,
                COUNT(DISTINCT cert.id) as certificates
         FROM users u
         LEFT JOIN enrollments e ON u.id = e.user_id
         LEFT JOIN certificates cert ON u.id = cert.user_id
         WHERE u.role = 'student'
         GROUP BY u.id
         ORDER BY u.name ASC`
      );
      return res.json(dbRes.rows);
    } else {
      // Mock mode
      return res.json(databaseTables.students.rows);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/reports - Analytics growth and rates
router.get('/reports', requireAuth(['admin']), async (req, res, next) => {
  try {
    const dbActive = await isDbActive();
    if (dbActive) {
      // 1. Get revenue by month
      const revRes = await query(
        `SELECT TO_CHAR(paid_at, 'Mon') as month, SUM(amount) as revenue
         FROM payments
         WHERE payment_status = 'paid' AND paid_at IS NOT NULL
         GROUP BY TO_CHAR(paid_at, 'Mon'), DATE_TRUNC('month', paid_at)
         ORDER BY DATE_TRUNC('month', paid_at) ASC`
      );

      // 2. Get course completion rates
      const completionRes = await query(
        `SELECT c.title as course,
                (COUNT(CASE WHEN e.status = 'completed' THEN 1 END)::float / NULLIF(COUNT(e.id), 0)) * 100 as rate
         FROM courses c
         LEFT JOIN enrollments e ON c.id = e.course_id
         WHERE c.status = 'published'
         GROUP BY c.id, c.title`
      );

      return res.json({
        revenue: revRes.rows.length > 0 ? revRes.rows : reports.revenue,
        completion: completionRes.rows.length > 0 ? completionRes.rows.map(r => ({ course: r.course, rate: Math.round(Number(r.rate) || 0) })) : reports.completion
      });
    } else {
      // Mock mode
      return res.json(reports);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/database/:tableName - Whitelisted table browser with parameters
router.get('/database/:tableName', requireAuth(['admin']), async (req, res, next) => {
  try {
    const tableName = req.params.tableName;
    const allowedTables = [
      'users', 'courses', 'modules', 'lessons', 'enrollments', 'progress',
      'assessments', 'questions', 'options', 'assessment_attempts', 'certificates', 'payments'
    ];

    if (!allowedTables.includes(tableName)) {
      return res.status(403).json({ message: 'Access forbidden: invalid table name' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      // Strict whitelist check prevents SQL injection.
      const columnsRes = await query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      );
      const columns = columnsRes.rows.map(col => col.column_name);

      const dataRes = await query(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 50`);
      return res.json({
        table: tableName,
        columns,
        rows: dataRes.rows,
        connected: true
      });
    } else {
      // Mock mode
      const selected = databaseTables[tableName];
      if (!selected) {
        return res.status(404).json({ message: 'Table not found in mock data' });
      }
      return res.json({
        table: tableName,
        columns: selected.columns,
        rows: selected.rows,
        connected: false
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
