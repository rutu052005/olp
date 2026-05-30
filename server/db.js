import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client:', err.message);
  });
} else {
  console.warn('DATABASE_URL is not set. Database pool will not be initialized.');
}

export const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized.');
  }
  return pool.query(text, params);
};

export const getStatus = async () => {
  if (!pool) return 'mock-data';
  try {
    const res = await pool.query('SELECT 1');
    if (res) return 'connected';
  } catch (err) {
    console.warn('Database health check failed:', err.message);
    return 'disconnected';
  }
  return 'disconnected';
};

export { pool };
