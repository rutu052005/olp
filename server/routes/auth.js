import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, pool } from '../db.js';
import { databaseTables } from '../../src/sampleData.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validate.js';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'development-secret';

function signUser(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    jwtSecret,
    { expiresIn: '1d' }
  );
}

// Register
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const assignedRole = role || 'student';
    const status = 'active';
    const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`;

    const useDb = pool && (await pool.query('SELECT 1').then(() => true).catch(() => false));

    if (useDb) {
      // Check duplicate
      const checkRes = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (checkRes.rows.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const insertRes = await query(
        `INSERT INTO users (name, email, password_hash, role, status, avatar_url, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, name, email, role, status, avatar_url`,
        [name, email, passwordHash, assignedRole, status, avatarUrl]
      );
      const user = insertRes.rows[0];
      return res.status(201).json({ user, token: signUser(user) });
    } else {
      // Mock mode
      const exists = databaseTables.users.rows.find((u) => u.email === email);
      if (exists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        role: assignedRole,
        status,
        avatar_url: avatarUrl,
      };

      databaseTables.users.rows.push(newUser);
      return res.status(201).json({ user: newUser, token: signUser(newUser) });
    }
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const useDb = pool && (await pool.query('SELECT 1').then(() => true).catch(() => false));

    if (useDb) {
      const dbRes = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (dbRes.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const user = dbRes.rows[0];
      
      // Compare password
      const match = bcrypt.compareSync(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const { password_hash, ...profile } = user;
      return res.json({ user: profile, token: signUser(profile) });
    } else {
      // Mock Mode fallback
      const { dbError, pool } = await import('../db.js');
      const user = databaseTables.users.rows.find((u) => u.email === email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password (Mock Mode). Pool: ' + !!pool + ' Error: ' + dbError });
      }
        } catch (e) {
          // If password_hash is plain text
          if (user.password_hash !== password) {
            return res.status(401).json({ message: 'Invalid email or password (Mock Mode)' });
          }
        }
      }
      return res.json({ user, token: signUser(user) });
    }
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Me
router.get('/me', requireAuth(), async (req, res, next) => {
  try {
    const useDb = pool && (await pool.query('SELECT 1').then(() => true).catch(() => false));

    if (useDb) {
      const dbRes = await query('SELECT id, name, email, role, status, avatar_url FROM users WHERE id = $1', [req.user.id]);
      if (dbRes.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ user: dbRes.rows[0] });
    } else {
      const user = databaseTables.users.rows.find((u) => u.id === req.user.id || u.email === req.user.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found (Mock Mode)' });
      }
      return res.json({ user });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
