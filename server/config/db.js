import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

const { Pool } = pg;

// Construct configuration from DATABASE_URL or individual PG* variables
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PGMAX_CLIENTS || '10', 10),
      idleTimeoutMillis: parseInt(process.env.PGIDLE_TIMEOUT_MS || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.PGCONN_TIMEOUT_MS || '5000', 10),
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'it_asset_management',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PGMAX_CLIENTS || '10', 10),
      idleTimeoutMillis: parseInt(process.env.PGIDLE_TIMEOUT_MS || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.PGCONN_TIMEOUT_MS || '5000', 10),
    };

export const pool = new Pool(poolConfig);

// Handle idle connection errors on the pool level
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client pool:', err.message);
});

/**
 * Reusable query helper with error logging
 * @param {string} text - SQL statement
 * @param {Array} [params] - Query parameters
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_SQL === 'true') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', {
      message: error.message,
      query: text,
    });
    throw error;
  }
}

/**
 * Tests database connectivity and reports health metrics
 * @returns {Promise<{ ok: boolean, latencyMs?: number, version?: string, error?: string }>}
 */
export async function testConnection() {
  const start = Date.now();
  try {
    const res = await pool.query('SELECT NOW() AS current_time, version() AS pg_version;');
    const latencyMs = Date.now() - start;
    return {
      ok: true,
      latencyMs,
      timestamp: res.rows[0]?.current_time,
      version: res.rows[0]?.pg_version?.split(' on ')[0] || 'PostgreSQL',
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
    };
  }
}

export default {
  pool,
  query,
  testConnection,
};
