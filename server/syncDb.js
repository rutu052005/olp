import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/learnsphere';
  
  const urlObj = new URL(connectionString);
  const dbName = urlObj.pathname.substring(1);
  
  console.log(`Connecting to PostgreSQL server to verify database "${dbName}"...`);
  urlObj.pathname = '/postgres';
  
  const clientInit = new Client({ connectionString: urlObj.toString() });
  
  try {
    await clientInit.connect();
    
    const res = await clientInit.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (res.rows.length === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      // Validate dbName to prevent SQL injection (must be alphanumeric/underscore)
      if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
        throw new Error('Invalid database name format.');
      }
      await clientInit.query(`CREATE DATABASE ${dbName};`);
      console.log(`Database "${dbName}" created successfully!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error verifying database existence:', err);
    process.exit(1);
  } finally {
    await clientInit.end();
  }

  console.log(`Connecting to database "${dbName}" to sync schema and seed...`);
  const clientSync = new Client({ connectionString });
  
  try {
    await clientSync.connect();
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying schema.sql...');
    await clientSync.query(schemaSql);
    console.log('schema.sql applied successfully!');
    
    // Read seed.sql
    const seedPath = path.join(__dirname, '../database/seed.sql');
    console.log(`Reading seed from: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    
    console.log('Applying seed.sql...');
    await clientSync.query(seedSql);
    console.log('seed.sql applied successfully!');
    
    console.log('Database synchronization complete!');
  } catch (err) {
    console.error('Error syncing database:', err.message);
    process.exit(1);
  } finally {
    await clientSync.end();
  }
}

run();
