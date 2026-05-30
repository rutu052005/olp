import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORTABLE_DIR = path.resolve(__dirname, '../pg-portable');
const PGSQL_DIR = path.join(PORTABLE_DIR, 'pgsql');
const BIN_DIR = path.join(PGSQL_DIR, 'bin');
const DATA_DIR = path.join(PORTABLE_DIR, 'data');
const ZIP_PATH = path.join(PORTABLE_DIR, 'postgresql.zip');
const LOG_FILE = path.join(PORTABLE_DIR, 'pg.log');

// PostgreSQL 16.14 for Windows x64
const DOWNLOAD_URL = 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1260202';

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading PostgreSQL binaries from ${url}...`);
    
    function startDownload(targetUrl) {
      https.get(targetUrl, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          console.log(`Redirecting to ${response.headers.location}...`);
          startDownload(response.headers.location);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: Status code ${response.statusCode}`));
          return;
        }
        
        const file = fs.createWriteStream(dest);
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        let lastPercent = -1;
        
        response.pipe(file);
        
        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (totalSize) {
            const percent = Math.floor((downloadedSize / totalSize) * 100);
            if (percent !== lastPercent && percent % 5 === 0) {
              console.log(`Download progress: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(1)}MB / ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
              lastPercent = percent;
            }
          }
        });
        
        file.on('finish', () => {
          file.close(() => {
            console.log('Download complete and file closed!');
            resolve();
          });
        });
        
        file.on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
        
        response.on('error', (err) => {
          file.destroy();
          fs.unlink(dest, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    }
    
    startDownload(url);
  });
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, { shell: true, stdio: 'inherit', ...options });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    if (!fs.existsSync(PORTABLE_DIR)) {
      fs.mkdirSync(PORTABLE_DIR, { recursive: true });
    }

    const postgresExe = path.join(BIN_DIR, 'postgres.exe');
    if (!fs.existsSync(postgresExe)) {
      console.log('PostgreSQL binaries not found locally.');
      
      if (!fs.existsSync(ZIP_PATH)) {
        await downloadFile(DOWNLOAD_URL, ZIP_PATH);
      }
      
      console.log('Extracting PostgreSQL binaries (this may take a minute)...');
      // Use PowerShell to extract the zip file
      const psCommand = `Expand-Archive -Path "${ZIP_PATH}" -DestinationPath "${PORTABLE_DIR}" -Force`;
      execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
      console.log('Extraction complete!');
      
      // Clean up the ZIP file to save disk space
      try {
        fs.unlinkSync(ZIP_PATH);
        console.log('Cleaned up zip archive.');
      } catch (e) {
        console.warn('Could not delete temporary zip archive:', e.message);
      }
    } else {
      console.log('PostgreSQL binaries already exist.');
    }

    // Initialize database if data directory is empty
    const pgVersionFile = path.join(DATA_DIR, 'PG_VERSION');
    if (!fs.existsSync(pgVersionFile)) {
      console.log('Initializing database cluster...');
      const initDbExe = path.join(BIN_DIR, 'initdb.exe');
      
      // Initialize with trust authentication for easy local setup
      const args = [
        '-D', `"${DATA_DIR}"`,
        '-U', 'postgres',
        '--auth-local=trust',
        '--auth-host=trust',
        '-E', 'UTF8'
      ];
      
      execSync(`"${initDbExe}" ${args.join(' ')}`, { stdio: 'inherit' });
      console.log('Database cluster initialized successfully!');
    } else {
      console.log('Database cluster already initialized.');
    }

    // Check if postgres is already running
    console.log('Checking database status...');
    const pgCtlExe = path.join(BIN_DIR, 'pg_ctl.exe');
    let isRunning = false;
    try {
      execSync(`"${pgCtlExe}" -D "${DATA_DIR}" status`, { stdio: 'ignore' });
      isRunning = true;
      console.log('PostgreSQL is already running.');
    } catch (e) {
      console.log('PostgreSQL is not running. Starting server...');
    }

    if (!isRunning) {
      // Start database
      const startArgs = [
        '-D', `"${DATA_DIR}"`,
        '-l', `"${LOG_FILE}"`,
        'start'
      ];
      execSync(`"${pgCtlExe}" ${startArgs.join(' ')}`, { stdio: 'inherit' });
      console.log('PostgreSQL started successfully!');
    }

    // Wait a brief moment for database startup and verify connection
    console.log('Verifying connection and running syncDb.js...');
    
    // Run database sync
    const syncDbPath = path.resolve(__dirname, 'syncDb.js');
    execSync(`node "${syncDbPath}"`, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    console.log('Database synced successfully!');
    
    console.log('\n======================================================');
    console.log('PostgreSQL is running portably on port 5432!');
    console.log('Connection URL: postgresql://postgres@localhost:5432/learnsphere');
    console.log('======================================================\n');
    
  } catch (error) {
    console.error('An error occurred during PostgreSQL portable setup:', error);
    process.exit(1);
  }
}

main();
