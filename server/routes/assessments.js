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

// GET /api/assessments/:courseId - Get assessments for a course
router.get('/:courseId', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const courseId = Number(req.params.courseId);
    const dbActive = await isDbActive();

    if (dbActive) {
      const dbRes = await query('SELECT * FROM assessments WHERE course_id = $1', [courseId]);
      return res.json(dbRes.rows);
    } else {
      const filtered = databaseTables.assessments.rows.filter(a => a.course_id === courseId);
      return res.json(filtered);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/:id/questions - Get questions and options (strip is_correct for students)
router.get('/:id/questions', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dbActive = await isDbActive();
    const isStudent = req.user.role === 'student';

    if (dbActive) {
      // Get questions
      const qsRes = await query('SELECT * FROM questions WHERE assessment_id = $1 ORDER BY question_order ASC', [id]);
      const qs = qsRes.rows;

      if (qs.length > 0) {
        const qIds = qs.map(q => q.id);
        // Get options
        const optsRes = await query(
          isStudent
            ? 'SELECT id, question_id, option_text FROM options WHERE question_id = ANY($1)'
            : 'SELECT id, question_id, option_text, is_correct FROM options WHERE question_id = ANY($1)',
          [qIds]
        );
        const options = optsRes.rows;

        // Nest options
        qs.forEach(q => {
          q.options = options.filter(o => Number(o.question_id) === Number(q.id));
        });
      }
      return res.json(qs);
    } else {
      // Mock mode
      // Get questions for this assessment
      const qs = databaseTables.questions?.[id] || databaseTables.questions?.[1] || [];
      const formatted = qs.map(q => {
        const options = q.options.map(o => {
          if (isStudent) {
            const { is_correct, ...publicOpt } = o;
            return publicOpt;
          }
          return o;
        });
        return { ...q, options };
      });
      return res.json(formatted);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/assessments - Create an assessment (Admin only)
router.post('/', requireAuth(['admin']), async (req, res, next) => {
  try {
    const { course_id, title, description, total_marks, passing_marks, time_limit_minutes } = req.body;
    const dbActive = await isDbActive();

    if (dbActive) {
      const dbRes = await query(
        `INSERT INTO assessments (course_id, title, description, total_marks, passing_marks, time_limit_minutes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [course_id, title, description, total_marks, passing_marks, time_limit_minutes]
      );
      return res.status(201).json(dbRes.rows[0]);
    } else {
      const newAssessment = {
        id: Date.now(),
        course_id: Number(course_id),
        title,
        description,
        total_marks: Number(total_marks) || 100,
        passing_marks: Number(passing_marks) || 60,
        time_limit_minutes: Number(time_limit_minutes) || 45
      };
      databaseTables.assessments.rows.push(newAssessment);
      return res.status(201).json(newAssessment);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/assessments/:id/submit - Submit quiz and calculate real score
router.post('/:id/submit', requireAuth(['student']), async (req, res, next) => {
  try {
    const assessmentId = Number(req.params.id);
    const { answers } = req.body; // e.g. { "questionId": optionId }
    const userId = req.user.id;

    const dbActive = await isDbActive();
    if (dbActive) {
      // Get assessment
      const assRes = await query('SELECT * FROM assessments WHERE id = $1', [assessmentId]);
      if (assRes.rows.length === 0) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      const assessment = assRes.rows[0];

      // Get questions + correct options
      const qsRes = await query('SELECT id, marks FROM questions WHERE assessment_id = $1', [assessmentId]);
      const questionsList = qsRes.rows;

      let score = 0;
      let totalMarks = 0;

      for (const q of questionsList) {
        totalMarks += Number(q.marks);
        const correctOptRes = await query('SELECT id FROM options WHERE question_id = $1 AND is_correct = TRUE', [q.id]);
        if (correctOptRes.rows.length > 0) {
          const correctOptId = Number(correctOptRes.rows[0].id);
          const submittedOptId = Number(answers[q.id]);
          if (submittedOptId === correctOptId) {
            score += Number(q.marks);
          }
        }
      }

      if (totalMarks === 0) totalMarks = 100;
      const percentage = (score / totalMarks) * 100;
      const status = percentage >= Number(assessment.passing_marks) ? 'passed' : 'failed';

      // Save attempt
      const attemptRes = await query(
        `INSERT INTO assessment_attempts (user_id, assessment_id, score, percentage, status, started_at, submitted_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [userId, assessmentId, score, percentage, status]
      );

      return res.json({
        score,
        percentage,
        status,
        total_marks: totalMarks,
        attempt: attemptRes.rows[0]
      });
    } else {
      // Mock mode
      const assessment = databaseTables.assessments.rows.find(a => a.id === assessmentId) || databaseTables.assessments.rows[0];
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found (Mock Mode)' });
      }

      // Check correct options from sampleData questions
      const questionsList = databaseTables.questions?.[assessmentId] || databaseTables.questions?.[1] || [];
      let score = 0;
      let totalMarks = 0;

      questionsList.forEach(q => {
        totalMarks += q.marks;
        const correctOption = q.options.find(o => o.is_correct);
        if (correctOption) {
          const correctOptId = correctOption.id;
          const submittedOptId = answers[q.id];
          if (Number(submittedOptId) === Number(correctOptId)) {
            score += q.marks;
          }
        }
      });

      if (totalMarks === 0) totalMarks = 100;
      const percentage = Math.round((score / totalMarks) * 100);
      const status = percentage >= assessment.passing_marks ? 'passed' : 'failed';

      const attempt = {
        id: Date.now(),
        user_id: userId,
        assessment_id: assessmentId,
        score,
        percentage,
        status,
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString()
      };

      databaseTables.assessment_attempts.rows.push(attempt);

      return res.json({
        score,
        percentage,
        status,
        total_marks: totalMarks,
        attempt
      });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/assessment-attempts/user/:userId - Get assessment history
router.get('/attempts/user/:userId', requireAuth(['student', 'admin']), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const dbActive = await isDbActive();
    if (dbActive) {
      const dbRes = await query(
        `SELECT aa.id, aa.user_id, aa.assessment_id, aa.score, aa.percentage, aa.status, aa.started_at, aa.submitted_at,
                a.title as assessment_title, c.title as course_title
         FROM assessment_attempts aa
         JOIN assessments a ON aa.assessment_id = a.id
         JOIN courses c ON a.course_id = c.id
         WHERE aa.user_id = $1
         ORDER BY aa.submitted_at DESC`,
        [userId]
      );
      return res.json(dbRes.rows);
    } else {
      // Mock mode
      const attempts = databaseTables.assessment_attempts?.rows?.filter(aa => aa.user_id === userId) || [];
      const enriched = attempts.map(aa => {
        const ass = databaseTables.assessments.rows.find(a => a.id === aa.assessment_id);
        const course = databaseTables.courses.rows.find(c => c.id === ass?.course_id);
        return {
          ...aa,
          assessment_title: ass?.title || 'Unknown Assessment',
          course_title: course?.title || 'Unknown Course'
        };
      });
      return res.json(enriched);
    }
  } catch (err) {
    next(err);
  }
});

export default router;
