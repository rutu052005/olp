import express from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET note for a specific lesson
router.get('/:lessonId', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({ message: 'Invalid lesson ID' });
    }

    const { rows } = await query(
      `SELECT content FROM student_notes WHERE user_id = $1 AND lesson_id = $2`,
      [userId, lessonId]
    );

    if (rows.length === 0) {
      return res.json({ content: '' }); // Return empty if no note found
    }

    res.json({ content: rows[0].content });
  } catch (error) {
    console.error('Error fetching note:', error.message);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
});

// POST save a note for a specific lesson
router.post('/:lessonId', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({ message: 'Invalid lesson ID' });
    }

    // Upsert the note
    await query(
      `INSERT INTO student_notes (user_id, lesson_id, content, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, lesson_id) 
       DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
      [userId, lessonId, content || '']
    );

    res.json({ message: 'Note saved successfully' });
  } catch (error) {
    console.error('Error saving note:', error.message);
    res.status(500).json({ message: 'Failed to save note' });
  }
});

export default router;
