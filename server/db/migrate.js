import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('----------------------------------------------------');
  console.log('IT Asset & Inventory Management - Database Migration');
  console.log('----------------------------------------------------');
  console.log(`Target Database: ${process.env.PGDATABASE || 'it_asset_management'} at ${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}`);

  const client = await pool.connect();
  try {
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Applying 001_initial_schema.sql...');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('✓ Migration applied successfully!');

    // Query tables list to verify
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\nVerified Public Tables:');
    tablesRes.rows.forEach((r) => {
      console.log(`  - ${r.table_name}`);
    });

    console.log('\nMigration complete.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('\n✗ Migration failed with error:');
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
