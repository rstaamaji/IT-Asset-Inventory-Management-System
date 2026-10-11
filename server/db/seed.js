import dotenv from 'dotenv';
import { pool } from '../config/db.js';
import { MOCK_CATEGORIES } from '../../src/data/mockCategories.js';
import { MOCK_EMPLOYEES } from '../../src/data/mockEmployees.js';
import { MOCK_ASSETS } from '../../src/data/mockAssets.js';
import { MOCK_ASSIGNMENTS } from '../../src/data/mockAssignments.js';

dotenv.config();

async function runSeed() {
  console.log('----------------------------------------------------');
  console.log('IT Asset & Inventory Management - Database Seeder');
  console.log('----------------------------------------------------');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed Categories
    console.log(`Seeding ${MOCK_CATEGORIES.length} categories...`);
    for (const cat of MOCK_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description;`,
        [cat.id, cat.name, cat.description, cat.createdAt || new Date()]
      );
    }

    // 2. Seed Employees
    console.log(`Seeding ${MOCK_EMPLOYEES.length} employees...`);
    for (const emp of MOCK_EMPLOYEES) {
      await client.query(
        `INSERT INTO employees (id, employee_code, name, email, department, position, location, phone, status, joined_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           employee_code = EXCLUDED.employee_code,
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           department = EXCLUDED.department,
           position = EXCLUDED.position,
           location = EXCLUDED.location,
           phone = EXCLUDED.phone,
           status = EXCLUDED.status,
           joined_date = EXCLUDED.joined_date;`,
        [
          emp.id,
          emp.employeeCode,
          emp.name,
          emp.email,
          emp.department,
          emp.position,
          emp.location,
          emp.phone || null,
          emp.status || 'Active',
          emp.joinedDate || new Date(),
        ]
      );
    }

    // 3. Seed Assets
    console.log(`Seeding ${MOCK_ASSETS.length} assets...`);
    for (const ast of MOCK_ASSETS) {
      // Find category ID matching ast.category
      const catRes = await client.query('SELECT id FROM categories WHERE name = $1 LIMIT 1', [ast.category]);
      const categoryId = catRes.rows[0]?.id || 'cat-010'; // fallback to Other

      // Find employee ID if assigned
      let assignedEmpId = null;
      if (ast.assignedTo?.email) {
        const empRes = await client.query('SELECT id FROM employees WHERE email = $1 LIMIT 1', [ast.assignedTo.email]);
        assignedEmpId = empRes.rows[0]?.id || null;
      }

      await client.query(
        `INSERT INTO assets (id, asset_code, asset_name, category_id, brand, model, serial_number, purchase_date, purchase_price, warranty_end, location, status, assigned_to_employee_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           asset_code = EXCLUDED.asset_code,
           asset_name = EXCLUDED.asset_name,
           category_id = EXCLUDED.category_id,
           brand = EXCLUDED.brand,
           model = EXCLUDED.model,
           serial_number = EXCLUDED.serial_number,
           purchase_date = EXCLUDED.purchase_date,
           purchase_price = EXCLUDED.purchase_price,
           warranty_end = EXCLUDED.warranty_end,
           location = EXCLUDED.location,
           status = EXCLUDED.status,
           assigned_to_employee_id = EXCLUDED.assigned_to_employee_id;`,
        [
          ast.id,
          ast.assetCode,
          ast.assetName,
          categoryId,
          ast.brand,
          ast.model || '—',
          ast.serialNumber,
          ast.purchaseDate || new Date(),
          ast.purchasePrice || 0,
          ast.warrantyEnd && ast.warrantyEnd !== '—' ? ast.warrantyEnd : null,
          ast.location,
          ast.status,
          assignedEmpId,
        ]
      );

      // Seed status history if available
      if (Array.isArray(ast.statusHistory)) {
        for (const sh of ast.statusHistory) {
          await client.query(
            `INSERT INTO asset_status_history (id, asset_id, previous_status, new_status, reason, actor, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING;`,
            [
              sh.id || `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              ast.id,
              sh.previousStatus || null,
              sh.newStatus,
              sh.reason || null,
              sh.actor || null,
              sh.timestamp ? new Date(sh.timestamp) : new Date(),
            ]
          );
        }
      }
    }

    // 4. Seed Assignments
    console.log(`Seeding ${MOCK_ASSIGNMENTS.length} assignments...`);
    for (const asg of MOCK_ASSIGNMENTS) {
      await client.query(
        `INSERT INTO assignments (id, asset_id, employee_id, assigned_date, expected_return_date, returned_date, notes, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           asset_id = EXCLUDED.asset_id,
           employee_id = EXCLUDED.employee_id,
           assigned_date = EXCLUDED.assigned_date,
           expected_return_date = EXCLUDED.expected_return_date,
           returned_date = EXCLUDED.returned_date,
           notes = EXCLUDED.notes,
           status = EXCLUDED.status;`,
        [
          asg.id,
          asg.assetId,
          asg.employeeId,
          asg.assignedDate || new Date(),
          asg.expectedReturnDate || null,
          asg.returnedDate || null,
          asg.notes || null,
          asg.status,
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✓ Database seeded successfully with initial dataset!');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('✗ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
