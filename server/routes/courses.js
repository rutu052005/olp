import express from 'express';
import { query, pool } from '../db.js';
import { databaseTables } from '../../src/sampleData.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to check DB status
const isDbActive = async () => {
  if (!pool) return false;
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

// GET /api/courses - List all published courses
router.get('/', async (req, res, next) => {
  try {
    const dbActive = await isDbActive();
    if (dbActive) {
      const dbRes = await query(
        `SELECT c.id, c.title, c.slug, c.description, c.category, c.level, c.difficulty, c.price,
                c.thumbnail_url, c.instructor_name, c.duration_hours, c.rating, c.outcomes, c.language, c.status,
                (
                  SELECT l.video_url
                  FROM modules m
                  JOIN lessons l ON l.module_id = m.id
                  WHERE m.course_id = c.id
                  ORDER BY m.module_order ASC, l.lesson_order ASC
                  LIMIT 1
                ) AS promo_video_url
         FROM courses c
         WHERE c.status = 'published'
         ORDER BY c.rating DESC`
      );
      return res.json(dbRes.rows);
    } else {
      // Mock fallback
      const published = databaseTables.courses.rows.filter(c => c.status === 'published').map(c => {
        let promo_video_url = 'https://www.youtube.com/watch?v=UrsmFxEIp5k';
        if (c.id === 2) promo_video_url = 'https://www.youtube.com/watch?v=_uQrJ0TkZlc';
        if (c.id === 3) promo_video_url = 'https://www.youtube.com/watch?v=RBSGKlAxfok';
        if (c.id === 4) promo_video_url = 'https://www.youtube.com/watch?v=fwY9QvHnp3U';
        if (c.id === 5) promo_video_url = 'https://www.youtube.com/watch?v=HXV3zeQKqGY';
        if (c.id === 6) promo_video_url = 'https://www.youtube.com/watch?v=t89KOSmG6U4';
        if (c.id === 7) promo_video_url = 'https://www.youtube.com/watch?v=ENrzD9HAZK4';
        if (c.id === 8) promo_video_url = 'https://www.youtube.com/watch?v=42oYgS-wI30';
        return { ...c, promo_video_url };
      });
      return res.json(published);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/:id - Detailed course view with nested modules and lessons
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dbActive = await isDbActive();

    if (dbActive) {
      const courseRes = await query('SELECT * FROM courses WHERE id = $1', [id]);
      if (courseRes.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      const course = courseRes.rows[0];

      // Fetch modules
      const modulesRes = await query('SELECT * FROM modules WHERE course_id = $1 ORDER BY module_order ASC', [id]);
      const modules = modulesRes.rows;

      // Fetch lessons for all modules
      if (modules.length > 0) {
        const moduleIds = modules.map(m => m.id);
        const lessonsRes = await query(
          'SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY lesson_order ASC',
          [moduleIds]
        );
        const lessons = lessonsRes.rows;

        // Nest lessons in modules
        modules.forEach(m => {
          m.lessons = lessons.filter(l => Number(l.module_id) === Number(m.id));
        });
      }

      course.modules = modules;
      return res.json(course);
    } else {
      // Mock fallback
      const course = databaseTables.courses.rows.find(c => c.id === id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found (Mock Mode)' });
      }

      // Format modules and lessons from in-memory fallback
      // Check if we have modules matching this course_id in databaseTables
      let modules = databaseTables.modules?.rows?.filter(m => m.course_id === id) || [];
      if (modules.length === 0) {
        // Fallback to sample data structured lessonsByCourse
        // Generate mock modules
        modules = [
          {
            id: id * 10 + 1,
            course_id: id,
            title: 'Module 1: Foundations',
            description: `Core concepts for ${course.title}`,
            lessons: [
              { id: id * 100 + 1, title: 'Course orientation', duration_minutes: 12 },
              { id: id * 100 + 2, title: 'Key concepts and setup', duration_minutes: 24 },
              { id: id * 100 + 3, title: 'Guided practice lab', duration_minutes: 36 },
            ]
          },
          {
            id: id * 10 + 2,
            course_id: id,
            title: 'Module 2: Applied Skills',
            description: 'Hands-on workflow with real-world examples',
            lessons: [
              { id: id * 100 + 4, title: 'Implementation walkthrough', duration_minutes: 31 },
              { id: id * 100 + 5, title: 'Case study', duration_minutes: 28 },
              { id: id * 100 + 6, title: 'Practice assignment', duration_minutes: 44 },
            ]
          },
          {
            id: id * 10 + 3,
            course_id: id,
            title: 'Module 3: Assessment Readiness',
            description: 'Review, recap, and final quiz preparation',
            lessons: [
              { id: id * 100 + 7, title: 'Concept recap', duration_minutes: 18 },
              { id: id * 100 + 8, title: 'Assessment strategy', duration_minutes: 16 },
            ]
          }
        ];
      } else {
        // Hydrate module lessons from databaseTables.lessons
        modules.forEach(m => {
          m.lessons = databaseTables.lessons?.rows?.filter(l => l.module_id === m.id) || [];
        });
      }

      const fullCourse = { ...course, modules };
      return res.json(fullCourse);
    }
  } catch (err) {
    next(err);
  }
});



// POST /api/courses - Create a course (Public for testing/seeding)
router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, level, difficulty, price, thumbnail_url, instructor_name, duration_hours, outcomes, language } = req.body;
    const dbActive = await isDbActive();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (dbActive) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const dbRes = await client.query(
          `INSERT INTO courses (title, slug, description, category, level, difficulty, price, thumbnail_url, instructor_name, duration_hours, outcomes, language, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published')
           RETURNING *`,
          [
            title, 
            slug, 
            description || `Learn ${title} step-by-step from industry experts.`, 
            category, 
            level, 
            difficulty, 
            price || 0, 
            thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80', 
            instructor_name, 
            duration_hours || 10, 
            outcomes || ['Understand core concepts', 'Build hands-on practice labs', 'Complete final assessment'], 
            language || 'English'
          ]
        );
        const course = dbRes.rows[0];

        // Seed 3 modules
        const m1 = await client.query(
          `INSERT INTO modules (course_id, title, description, module_order) VALUES ($1, $2, $3, $4) RETURNING id`,
          [course.id, 'Module 1: Introduction & Setup', 'Get set up and cover core prerequisites.', 1]
        );
        const m1Id = m1.rows[0].id;
        await client.query(
          `INSERT INTO lessons (module_id, title, description, video_url, duration_minutes, lesson_order) VALUES
           ($1, '1.1 Getting Started', 'Prerequisites and overview.', 'https://www.youtube.com/watch?v=UrsmFxEIp5k', 12, 1),
           ($1, '1.2 Installation & Config', 'Setting up VS Code and developer tools.', 'https://www.youtube.com/watch?v=Ke90Tje7VS0', 22, 2)`,
          [m1Id]
        );

        const m2 = await client.query(
          `INSERT INTO modules (course_id, title, description, module_order) VALUES ($1, $2, $3, $4) RETURNING id`,
          [course.id, 'Module 2: Core Concepts', 'Fundamental theory and code exercises.', 2]
        );
        const m2Id = m2.rows[0].id;
        await client.query(
          `INSERT INTO lessons (module_id, title, description, video_url, duration_minutes, lesson_order) VALUES
           ($1, '2.1 Core Syntax & Principles', 'Basic language constructs.', 'https://www.youtube.com/watch?v=lsMQRaeKNDk', 35, 1),
           ($1, '2.2 Advanced Concepts', 'Working with complex data types.', 'https://www.youtube.com/watch?v=RBSGKlAxfok', 40, 2)`,
          [m2Id]
        );

        const m3 = await client.query(
          `INSERT INTO modules (course_id, title, description, module_order) VALUES ($1, $2, $3, $4) RETURNING id`,
          [course.id, 'Module 3: Hands-On Project', 'Applying what you learned to build a live app.', 3]
        );
        const m3Id = m3.rows[0].id;
        await client.query(
          `INSERT INTO lessons (module_id, title, description, video_url, duration_minutes, lesson_order) VALUES
           ($1, '3.1 Building the App', 'Step-by-step implementation walkthrough.', 'https://www.youtube.com/watch?v=qz0aGYMCip0', 48, 1),
           ($1, '3.2 Deployment and Beyond', 'Hosting your app on a cloud provider.', 'https://www.youtube.com/watch?v=ENrzD9HAZK4', 30, 2)`,
          [m3Id]
        );

        await client.query('COMMIT');
        return res.status(201).json(course);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const newCourse = {
        id: Date.now(),
        title,
        slug,
        description: description || `Learn ${title} step-by-step from industry experts.`,
        category,
        level,
        difficulty,
        price: Number(price) || 0,
        thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80',
        instructor_name,
        duration_hours: Number(duration_hours) || 10,
        rating: 5.0,
        outcomes: outcomes || ['Understand core concepts', 'Build hands-on practice labs', 'Complete final assessment'],
        language: language || 'English',
        status: 'published'
      };
      databaseTables.courses.rows.push(newCourse);

      // Add to mock modules/lessons
      const mockModules = [
        {
          id: newCourse.id * 10 + 1,
          course_id: newCourse.id,
          title: 'Module 1: Introduction & Setup',
          description: 'Core prerequisites and environment setup.',
          lessons: [
            { id: newCourse.id * 100 + 1, title: '1.1 Getting Started', video_url: 'https://www.youtube.com/watch?v=UrsmFxEIp5k', duration_minutes: 12 },
            { id: newCourse.id * 100 + 2, title: '1.2 Installation & Config', video_url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0', duration_minutes: 22 }
          ]
        },
        {
          id: newCourse.id * 10 + 2,
          course_id: newCourse.id,
          title: 'Module 2: Core Concepts',
          description: 'Fundamental theory and code exercises.',
          lessons: [
            { id: newCourse.id * 100 + 3, title: '2.1 Core Syntax & Principles', video_url: 'https://www.youtube.com/watch?v=lsMQRaeKNDk', duration_minutes: 35 },
            { id: newCourse.id * 100 + 4, title: '2.2 Advanced Concepts', video_url: 'https://www.youtube.com/watch?v=RBSGKlAxfok', duration_minutes: 40 }
          ]
        },
        {
          id: newCourse.id * 10 + 3,
          course_id: newCourse.id,
          title: 'Module 3: Hands-On Project',
          description: 'Applying what you learned to build a live app.',
          lessons: [
            { id: newCourse.id * 100 + 5, title: '3.1 Building the App', video_url: 'https://www.youtube.com/watch?v=qz0aGYMCip0', duration_minutes: 48 },
            { id: newCourse.id * 100 + 6, title: '3.2 Deployment and Beyond', video_url: 'https://www.youtube.com/watch?v=ENrzD9HAZK4', duration_minutes: 30 }
          ]
        }
      ];

      if (!databaseTables.modules) databaseTables.modules = { rows: [] };
      if (!databaseTables.lessons) databaseTables.lessons = { rows: [] };

      mockModules.forEach(m => {
        databaseTables.modules.rows.push({
          id: m.id,
          course_id: m.course_id,
          title: m.title,
          description: m.description,
          module_order: m.id % 10
        });
        m.lessons.forEach((l, index) => {
          databaseTables.lessons.rows.push({
            id: l.id,
            module_id: m.id,
            title: l.title,
            video_url: l.video_url,
            duration_minutes: l.duration_minutes,
            lesson_order: index + 1
          });
        });
      });

      return res.status(201).json(newCourse);
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/courses/:id - Update course details (Admin only)
router.put('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, description, category, level, difficulty, price, thumbnail_url, instructor_name, duration_hours, outcomes, language, status } = req.body;
    const dbActive = await isDbActive();

    if (dbActive) {
      const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;
      const dbRes = await query(
        `UPDATE courses
         SET title = COALESCE($1, title),
             slug = COALESCE($2, slug),
             description = COALESCE($3, description),
             category = COALESCE($4, category),
             level = COALESCE($5, level),
             difficulty = COALESCE($6, difficulty),
             price = COALESCE($7, price),
             thumbnail_url = COALESCE($8, thumbnail_url),
             instructor_name = COALESCE($9, instructor_name),
             duration_hours = COALESCE($10, duration_hours),
             outcomes = COALESCE($11, outcomes),
             language = COALESCE($12, language),
             status = COALESCE($13, status),
             updated_at = NOW()
         WHERE id = $14
         RETURNING *`,
        [title, slug, description, category, level, difficulty, price, thumbnail_url, instructor_name, duration_hours, outcomes, language, status, id]
      );
      if (dbRes.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      return res.json(dbRes.rows[0]);
    } else {
      const idx = databaseTables.courses.rows.findIndex(c => c.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Course not found (Mock Mode)' });
      }
      const existing = databaseTables.courses.rows[idx];
      const updated = {
        ...existing,
        ...req.body,
        id, // keep original ID
      };
      databaseTables.courses.rows[idx] = updated;
      return res.json(updated);
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/courses/:id - Soft-delete (archive) course (Admin only)
router.delete('/:id', requireAuth(['admin']), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const dbActive = await isDbActive();

    if (dbActive) {
      const dbRes = await query(
        "UPDATE courses SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *",
        [id]
      );
      if (dbRes.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }
      return res.status(204).send();
    } else {
      const course = databaseTables.courses.rows.find(c => c.id === id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found (Mock Mode)' });
      }
      course.status = 'archived';
      return res.status(204).send();
    }
  } catch (err) {
    next(err);
  }
});

export default router;
