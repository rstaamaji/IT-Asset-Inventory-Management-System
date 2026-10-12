import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

/**
 * Bootstrap an Initial Admin User
 * Run with: npm run auth:bootstrap-admin
 * Or with custom env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */
async function bootstrapAdmin() {
  console.log('====================================================');
  console.log('IT Asset & Inventory Management - Admin Bootstrapper');
  console.log('====================================================');

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@company.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = (process.env.ADMIN_NAME || 'System Administrator').trim();

  const client = await pool.connect();
  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users';
    `);

    if (tableCheck.rows.length === 0) {
      throw new Error(
        'The "users" table does not exist. Please run "npm run db:migrate" first.'
      );
    }

    // Check if user already exists
    const existing = await client.query(
      'SELECT id, email, role, status FROM users WHERE LOWER(email) = $1',
      [adminEmail]
    );

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    if (existing.rows.length > 0) {
      // Update existing admin account
      await client.query(
        `UPDATE users
         SET name = $1, password_hash = $2, role = 'Admin', status = 'Active', updated_at = CURRENT_TIMESTAMP
         WHERE LOWER(email) = $3`,
        [adminName, passwordHash, adminEmail]
      );
      console.log(`✓ Admin user "${adminEmail}" already exists. Credentials and role updated to Admin.`);
    } else {
      // Create new admin user
      const id = `usr-${crypto.randomUUID()}`;
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, 'Admin', 'Active')`,
        [id, adminName, adminEmail, passwordHash]
      );
      console.log(`✓ Created new Admin user "${adminEmail}" (ID: ${id}) successfully.`);
    }

    console.log('\nAdmin credentials configured:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Role:  Admin`);
    console.log(`  Password: ${'*'.repeat(adminPassword.length)} (hashed with bcrypt)`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('✗ Failed to bootstrap admin user:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

bootstrapAdmin();
