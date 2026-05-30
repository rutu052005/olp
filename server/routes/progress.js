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

// POST /api/progress/complete - Mark lesson complete + update enrollment progress
router.post('/complete', requireAuth(['student']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { course_id, module_id, lesson_id, time_spent_minutes } = req.body;

    if (!course_id || !module_id || !lesson_id) {
      return res.status(400).json({ message: 'course_id, module_id, and lesson_id are required' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      // 1. Insert or update progress record
      await query(
        `INSERT INTO progress (user_id, course_id, module_id, lesson_id, is_completed, completed_at, time_spent_minutes)
         VALUES ($1, $2, $3, $4, TRUE, NOW(), $5)
         ON CONFLICT (user_id, lesson_id)
         DO UPDATE SET is_completed = TRUE, completed_at = NOW(), time_spent_minutes = progress.time_spent_minutes + $5`,
        [userId, course_id, module_id, lesson_id, Number(time_spent_minutes) || 0]
      );

      // 2. Count total lessons in course
      const totalLessonsRes = await query(
        `SELECT COUNT(l.id) as count
         FROM lessons l
         JOIN modules m ON l.module_id = m.id
         WHERE m.course_id = $1`,
        [course_id]
      );
      const totalLessons = Number(totalLessonsRes.rows[0].count);

      // 3. Count completed lessons for user
      const completedLessonsRes = await query(
        `SELECT COUNT(id) as count
         FROM progress
         WHERE user_id = $1 AND course_id = $2 AND is_completed = TRUE`,
        [userId, course_id]
      );
      const completedLessons = Number(completedLessonsRes.rows[0].count);

      const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      const status = completionPercentage >= 100 ? 'completed' : 'active';

      // 4. Update enrollment progress
      const enrollRes = await query(
        `UPDATE enrollments
         SET completion_percentage = $1,
             status = $2,
             completed_at = $3
         WHERE user_id = $4 AND course_id = $5
         RETURNING *`,
        [completionPercentage, status, status === 'completed' ? new Date() : null, userId, course_id]
      );

      return res.json({
        message: 'Lesson marked as complete',
        progress: {
          course_id,
          module_id,
          lesson_id,
          is_completed: true,
          time_spent_minutes
        },
        enrollment: enrollRes.rows[0]
      });
    } else {
      // Mock mode
      let pRecord = databaseTables.progress.rows.find(p => p.user_id === userId && p.lesson_id === Number(lesson_id));
      if (!pRecord) {
        pRecord = {
          id: Date.now(),
          user_id: userId,
          course_id: Number(course_id),
          module_id: Number(module_id),
          lesson_id: Number(lesson_id),
          is_completed: true,
          completed_at: new Date().toISOString(),
          time_spent_minutes: Number(time_spent_minutes) || 0
        };
        databaseTables.progress.rows.push(pRecord);
      } else {
        pRecord.is_completed = true;
        pRecord.completed_at = new Date().toISOString();
        pRecord.time_spent_minutes += Number(time_spent_minutes) || 0;
      }

      // Calculate mock enrollment progress
      let totalLessons = 8;
      const courseModules = databaseTables.modules?.rows?.filter(m => m.course_id === Number(course_id)) || [];
      if (courseModules.length > 0) {
        const moduleIds = courseModules.map(m => m.id);
        const courseLessons = databaseTables.lessons?.rows?.filter(l => moduleIds.includes(l.module_id)) || [];
        totalLessons = courseLessons.length || 8;
      }

      const completedLessons = databaseTables.progress.rows.filter(
        p => p.user_id === userId && p.course_id === Number(course_id) && p.is_completed
      ).length;

      const completionPercentage = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

      const enrollment = databaseTables.enrollments.rows.find(
        e => e.user_id === userId && e.course_id === Number(course_id)
      );

      if (enrollment) {
        enrollment.completion_percentage = completionPercentage;
        if (completionPercentage >= 100) {
          enrollment.status = 'completed';
          enrollment.completed_at = new Date().toISOString().split('T')[0];
        } else {
          enrollment.status = 'active';
          enrollment.completed_at = null;
        }
      }

      return res.json({
        message: 'Lesson marked as complete (Mock Mode)',
        progress: pRecord,
        enrollment
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/progress/user/:userId/course/:courseId - Get all progress for user in a course
router.get('/user/:userId/course/:courseId', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const courseId = Number(req.params.courseId);

    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      const dbRes = await query(
        'SELECT * FROM progress WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );
      return res.json(dbRes.rows);
    } else {
      // Mock mode
      const userProgress = databaseTables.progress.rows.filter(p => p.user_id === userId && p.course_id === courseId);
      return res.json(userProgress);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
