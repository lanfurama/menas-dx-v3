import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env từ root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Từ backend/db/pool.js cần lên 2 cấp để đến root
const envPath = join(__dirname, '../../.env');

// Debug: Check if .env file exists
import { existsSync } from 'fs';
console.log('[Pool] Loading .env from:', envPath);
console.log('[Pool] .env file exists:', existsSync(envPath));

const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error('[Pool] Error loading .env:', envResult.error);
} else {
  console.log('[Pool] .env loaded successfully, parsed keys:', Object.keys(envResult.parsed || {}));
}

const { Pool } = pg;

// Pool để connect đến database config của hệ thống (menas_dx_config)
// Database này chứa các config cho database bên ngoài
// Đọc từ .env ở root directory
const getConfigPassword = () => {
  const pwd = process.env.CONFIG_DB_PASSWORD || process.env.DB_PASSWORD;
  console.log('[Pool] Reading password from env:', {
    CONFIG_DB_PASSWORD: process.env.CONFIG_DB_PASSWORD ? `${process.env.CONFIG_DB_PASSWORD.substring(0, 2)}***` : 'undefined',
    DB_PASSWORD: process.env.DB_PASSWORD ? `${process.env.DB_PASSWORD.substring(0, 2)}***` : 'undefined',
    pwdValue: pwd ? `${String(pwd).substring(0, 2)}***` : 'undefined',
    pwdType: typeof pwd
  });
  if (pwd === undefined || pwd === null) {
    return '';
  }
  return String(pwd);
};

const configPasswordStr = getConfigPassword();

const poolConfig = {
  host: process.env.CONFIG_DB_HOST || process.env.VITE_DB_HOST || 'localhost',
  port: parseInt(process.env.CONFIG_DB_PORT || process.env.VITE_DB_PORT || '5432'),
  database: process.env.CONFIG_DB_NAME || process.env.VITE_DB_NAME || 'menas_dx_config',
  user: process.env.CONFIG_DB_USER || process.env.VITE_DB_USER || 'postgres',
  password: configPasswordStr,
  ssl: (process.env.CONFIG_DB_SSL === 'true' || process.env.VITE_DB_SSL === 'true') ? { rejectUnauthorized: false } : false,
};

console.log('[Pool] Initializing configPool:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  passwordType: typeof poolConfig.password,
  passwordLength: poolConfig.password ? poolConfig.password.length : 0,
  passwordIsString: typeof poolConfig.password === 'string',
  ssl: !!poolConfig.ssl
});

export const configPool = new Pool({
  ...poolConfig,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection on startup
configPool.connect()
  .then((client) => {
    console.log('✅ Connected to Config Database:', poolConfig.database);
    // Test query
    return client.query('SELECT version()').then((result) => {
      console.log('✅ Database version:', result.rows[0].version.substring(0, 50) + '...');
      client.release();
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to Config Database');
    console.error('   Error:', err.message);
    console.error('   Code:', err.code);
    console.error('   Check your .env configuration:');
    console.error('   - Host:', poolConfig.host);
    console.error('   - Port:', poolConfig.port);
    console.error('   - Database:', poolConfig.database);
    console.error('   - User:', poolConfig.user);
    console.error('   - Password:', poolConfig.password ? '*** (length: ' + poolConfig.password.length + ')' : 'NOT SET');
    console.error('   - SSL:', poolConfig.ssl);
    console.error('');
    console.error('   Possible issues:');
    console.error('   1. Database server is not running or not accessible');
    console.error('   2. Database name does not exist');
    console.error('   3. Wrong credentials (user/password)');
    console.error('   4. Firewall blocking port', poolConfig.port);
    console.error('   5. Database name with dash may need quotes in PostgreSQL');
  });

configPool.on('error', (err) => {
  console.error('❌ Config Database pool error:', err.message);
});

// Helper để tạo pool cho database bên ngoài dựa trên config từ db_config table
export const createExternalPool = (dbConfig) => {
  return new Pool({
    host: dbConfig.host,
    port: parseInt(dbConfig.port),
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password !== undefined && dbConfig.password !== null ? String(dbConfig.password) : '',
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
  });
};

// Export configPool với tên pool để backward compatibility
export const pool = configPool;
