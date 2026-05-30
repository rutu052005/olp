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

// POST /api/enrollments - Enroll a student in a course
router.post('/', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' ? Number(req.body.user_id) : req.user.id;
    const courseId = Number(req.body.course_id);

    if (!userId || !courseId) {
      return res.status(400).json({ message: 'User ID and Course ID are required' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      // Check if already enrolled
      const check = await query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
      if (check.rows.length > 0) {
        return res.status(400).json({ message: 'User is already enrolled in this course' });
      }

      const dbRes = await query(
        `INSERT INTO enrollments (user_id, course_id, status, completion_percentage, enrollment_date)
         VALUES ($1, $2, 'active', 0, NOW())
         RETURNING *`,
        [userId, courseId]
      );
      return res.status(201).json(dbRes.rows[0]);
    } else {
      // Mock mode
      const exists = databaseTables.enrollments.rows.find(e => e.user_id === userId && e.course_id === courseId);
      if (exists) {
        return res.status(400).json({ message: 'User is already enrolled in this course (Mock Mode)' });
      }

      const newEnrollment = {
        id: Date.now(),
        user_id: userId,
        course_id: courseId,
        status: 'active',
        completion_percentage: 0,
        enrollment_date: new Date().toISOString().split('T')[0]
      };
      databaseTables.enrollments.rows.push(newEnrollment);
      return res.status(201).json(newEnrollment);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/enrollments/user/:userId - Get all enrollments for a user with nested course details
router.get('/user/:userId', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    console.log(`[DEBUG enrollments/user] req.user.id = ${req.user.id} (${typeof req.user.id}), userId = ${userId} (${typeof userId}), role = ${req.user.role}`);
    // Check permission: Student can only view their own enrollments
    if (req.user.role === 'student' && req.user.id !== userId) {
      console.log(`[DEBUG enrollments/user] Access DENIED: req.user.id (${req.user.id}) !== userId (${userId})`);
      return res.status(403).json({ message: 'Forbidden' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      const dbRes = await query(
        `SELECT e.id, e.user_id, e.course_id, e.status, e.completion_percentage, e.enrollment_date, e.completed_at,
                c.title as course_title, c.description as course_description, c.thumbnail_url as course_thumbnail,
                c.instructor_name as course_instructor, c.duration_hours as course_duration, c.rating as course_rating
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.user_id = $1`,
        [userId]
      );
      return res.json(dbRes.rows);
    } else {
      // Mock mode
      const userEnrollments = databaseTables.enrollments.rows.filter(e => e.user_id === userId);
      const enriched = userEnrollments.map(e => {
        const course = databaseTables.courses.rows.find(c => c.id === e.course_id);
        return {
          ...e,
          course_title: course?.title || 'Unknown Course',
          course_description: course?.description || '',
          course_thumbnail: course?.thumbnail_url || '',
          course_instructor: course?.instructor_name || '',
          course_duration: course?.duration_hours || 0,
          course_rating: course?.rating || 0
        };
      });
      return res.json(enriched);
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/enrollments/:id/progress - Update progress completion percentage
router.put('/:id/progress', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { completion_percentage } = req.body;

    if (completion_percentage === undefined) {
      return res.status(400).json({ message: 'completion_percentage is required' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      const status = Number(completion_percentage) >= 100 ? 'completed' : 'active';
      const dbRes = await query(
        `UPDATE enrollments
         SET completion_percentage = $1,
             status = $2,
             completed_at = $3
         WHERE id = $4
         RETURNING *`,
        [completion_percentage, status, status === 'completed' ? new Date() : null, id]
      );

      if (dbRes.rows.length === 0) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
      return res.json(dbRes.rows[0]);
    } else {
      // Mock mode
      const enrollment = databaseTables.enrollments.rows.find(e => e.id === id);
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found (Mock Mode)' });
      }
      enrollment.completion_percentage = Number(completion_percentage);
      if (enrollment.completion_percentage >= 100) {
        enrollment.status = 'completed';
        enrollment.completed_at = new Date().toISOString().split('T')[0];
      } else {
        enrollment.status = 'active';
        enrollment.completed_at = null;
      }
      return res.json(enrollment);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
