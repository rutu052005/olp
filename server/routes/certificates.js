import express from 'express';
import { query, pool } from '../db.js';
import { databaseTables } from '../../src/sampleData.js';
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

// POST /api/certificates/generate - Generate certificate (checks eligibility)
router.post('/generate', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' && req.body.user_id ? Number(req.body.user_id) : req.user.id;
    const courseId = Number(req.body.course_id);

    if (!courseId) {
      return res.status(400).json({ message: 'course_id is required' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      // 1. Find if there is a passing assessment attempt for this course
      const assRes = await query('SELECT id FROM assessments WHERE course_id = $1', [courseId]);
      let hasPassedAssessment = false;
      if (assRes.rows.length > 0) {
        const assessmentId = assRes.rows[0].id;
        const attemptRes = await query(
          "SELECT * FROM assessment_attempts WHERE user_id = $1 AND assessment_id = $2 AND status = 'passed'",
          [userId, assessmentId]
        );
        if (attemptRes.rows.length > 0) {
          hasPassedAssessment = true;
        }
      }

      // 2. Verify enrollment status
      const enrollRes = await query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );
      const isCompleted = enrollRes.rows.length > 0 && enrollRes.rows[0].status === 'completed';

      if (!isCompleted && !hasPassedAssessment) {
        return res.status(400).json({ message: 'You must pass the course assessment to earn a certificate.' });
      }

      // 3. Auto-complete enrollment if passed assessment
      if (hasPassedAssessment && !isCompleted) {
        if (enrollRes.rows.length === 0) {
          await query(
            `INSERT INTO enrollments (user_id, course_id, status, completion_percentage, completed_at, enrollment_date)
             VALUES ($1, $2, 'completed', 100, NOW(), NOW())`,
            [userId, courseId]
          );
        } else {
          await query(
            `UPDATE enrollments
             SET status = 'completed', completion_percentage = 100, completed_at = NOW()
             WHERE user_id = $1 AND course_id = $2`,
            [userId, courseId]
          );
        }
      }

      // 4. Check if already generated
      const existing = await query('SELECT * FROM certificates WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
      if (existing.rows.length > 0) {
        // Hydrate with name and course details
        const userRes = await query('SELECT name FROM users WHERE id = $1', [userId]);
        const courseRes = await query('SELECT title FROM courses WHERE id = $1', [courseId]);
        return res.json({
          ...existing.rows[0],
          student: userRes.rows[0]?.name || 'Student',
          course: courseRes.rows[0]?.title || 'Course'
        });
      }

      // Generate certificate
      const certId = `CERT-LS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const certUrl = `https://example.com/certificates/${certId}.pdf`;

      const insertRes = await query(
        `INSERT INTO certificates (certificate_id, user_id, course_id, issued_date, certificate_url, verification_status)
         VALUES ($1, $2, $3, CURRENT_DATE, $4, 'verified')
         RETURNING *`,
        [certId, userId, courseId, certUrl]
      );

      // Hydrate with name and course details
      const userRes = await query('SELECT name FROM users WHERE id = $1', [userId]);
      const courseRes = await query('SELECT title FROM courses WHERE id = $1', [courseId]);

      const result = {
        ...insertRes.rows[0],
        student: userRes.rows[0]?.name || 'Student',
        course: courseRes.rows[0]?.title || 'Course'
      };

      return res.status(201).json(result);
    } else {
      // Mock mode
      const hasPassedAssessment = databaseTables.assessment_attempts?.rows?.some(
        a => a.user_id === userId && a.status === 'passed'
      );
      const enrollment = databaseTables.enrollments.rows.find(
        e => e.user_id === userId && e.course_id === courseId
      );
      const isCompleted = enrollment && enrollment.status === 'completed';

      if (!isCompleted && !hasPassedAssessment) {
        return res.status(400).json({ message: 'You must pass the course assessment to earn a certificate (Mock Mode).' });
      }

      // Auto-complete enrollment in memory
      if (hasPassedAssessment && !isCompleted) {
        if (!enrollment) {
          databaseTables.enrollments.rows.push({
            id: Date.now(),
            user_id: userId,
            course_id: courseId,
            status: 'completed',
            completion_percentage: 100,
            completed_at: new Date().toISOString().split('T')[0],
            enrollment_date: new Date().toISOString().split('T')[0]
          });
        } else {
          enrollment.status = 'completed';
          enrollment.completion_percentage = 100;
          enrollment.completed_at = new Date().toISOString().split('T')[0];
        }
      }

      const existing = databaseTables.certificates.rows.find(c => c.user_id === userId && c.course_id === courseId);
      if (existing) {
        return res.json(existing);
      }

      // Generate certificate
      const certId = `CERT-LS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const user = databaseTables.users.rows.find(u => u.id === userId);
      const course = databaseTables.courses.rows.find(c => c.id === courseId);

      const newCert = {
        id: Date.now(),
        certificate_id: certId,
        user_id: userId,
        course_id: courseId,
        student: user?.name || 'Aarav Mehta',
        course: course?.title || 'Course Title',
        issued_date: new Date().toISOString().split('T')[0],
        certificate_url: `https://example.com/certificates/${certId}.pdf`,
        verification_status: 'verified'
      };

      databaseTables.certificates.rows.push(newCert);
      return res.status(201).json(newCert);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/certificates/user/:userId - Get all certificates of a user
router.get('/user/:userId', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    console.log(`[DEBUG certificates/user] req.user.id = ${req.user.id} (${typeof req.user.id}), userId = ${userId} (${typeof userId}), role = ${req.user.role}`);
    if (req.user.role === 'student' && req.user.id !== userId) {
      console.log(`[DEBUG certificates/user] Access DENIED: req.user.id (${req.user.id}) !== userId (${userId})`);
      return res.status(403).json({ message: 'Forbidden' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      const dbRes = await query(
        `SELECT cert.id, cert.certificate_id, cert.user_id, cert.course_id, cert.issued_date, cert.certificate_url, cert.verification_status,
                u.name as student, c.title as course
         FROM certificates cert
         JOIN users u ON cert.user_id = u.id
         JOIN courses c ON cert.course_id = c.id
         WHERE cert.user_id = $1`,
        [userId]
      );
      return res.json(dbRes.rows);
    } else {
      // Mock mode
      const userCerts = databaseTables.certificates.rows.filter(c => c.user_id === userId);
      return res.json(userCerts);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/certificates/verify/:certificateId - Verify a certificate publicly
router.get('/verify/:certificateId', async (req, res, next) => {
  try {
    const certId = req.params.certificateId;
    const dbActive = await isDbActive();

    if (dbActive) {
      const dbRes = await query(
        `SELECT cert.id, cert.certificate_id, cert.issued_date, cert.certificate_url, cert.verification_status,
                u.name as student, c.title as course
         FROM certificates cert
         JOIN users u ON cert.user_id = u.id
         JOIN courses c ON cert.course_id = c.id
         WHERE cert.certificate_id = $1 AND cert.verification_status = 'verified'`,
        [certId]
      );
      if (dbRes.rows.length === 0) {
        return res.status(404).json({ verified: false });
      }
      return res.json({ verified: true, certificate: dbRes.rows[0] });
    } else {
      // Mock mode
      const cert = databaseTables.certificates.rows.find(
        c => c.certificate_id === certId && c.verification_status === 'verified'
      );
      if (!cert) {
        return res.status(404).json({ verified: false });
      }
      return res.json({ verified: true, certificate: cert });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
