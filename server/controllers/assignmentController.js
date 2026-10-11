import crypto from 'crypto';
import { pool, query } from '../config/db.js';
import { success, created, notFound, conflict, badRequest } from '../utils/apiResponse.js';
import { handleDatabaseError } from '../utils/dbErrors.js';
import { parsePagination, isValidDate } from '../middleware/validate.js';

/**
 * Normalizes assignment database row into camelCase API response
 */
function formatAssignmentRow(row) {
  return {
    id: row.id,
    assetId: row.asset_id,
    employeeId: row.employee_id,
    assignedDate: row.assigned_date,
    expectedReturnDate: row.expected_return_date || null,
    returnedDate: row.returned_date || null,
    notes: row.notes || '',
    status: row.status,
    asset: row.asset_code
      ? {
          id: row.asset_id,
          assetCode: row.asset_code,
          assetName: row.asset_name,
          category: row.category_name || '',
          brand: row.brand || '',
          model: row.model || '—',
          serialNumber: row.serial_number || '',
          status: row.asset_current_status || '',
          location: row.location || '',
        }
      : null,
    employee: row.employee_code
      ? {
          id: row.employee_id,
          employeeCode: row.employee_code,
          name: row.employee_name,
          email: row.employee_email,
          department: row.department,
          position: row.position || '',
          location: row.employee_location || '',
          status: row.employee_status || '',
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/assignments
 * Paginated assignments list with search and status/employee/asset filters
 */
export async function getAssignments(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { q, status, employee_id, employeeId, asset_id, assetId } = req.query;

    const whereConditions = [];
    const params = [];

    // Search query
    if (q && q.trim()) {
      params.push(`%${q.trim()}%`);
      const idx = params.length;
      whereConditions.push(`(
        a.asset_code ILIKE $${idx} OR
        a.asset_name ILIKE $${idx} OR
        a.serial_number ILIKE $${idx} OR
        e.employee_code ILIKE $${idx} OR
        e.name ILIKE $${idx} OR
        e.email ILIKE $${idx} OR
        asg.notes ILIKE $${idx}
      )`);
    }

    // Status filter
    if (status && status.trim() && status.trim() !== 'All') {
      const allowed = ['Active', 'Returned'];
      if (!allowed.includes(status.trim())) {
        return badRequest(res, `Invalid status filter. Allowed values: ${allowed.join(', ')}`);
      }
      params.push(status.trim());
      whereConditions.push(`asg.status = $${params.length}`);
    }

    // Employee filter
    const targetEmpId = employee_id || employeeId;
    if (targetEmpId && targetEmpId.trim() && targetEmpId.trim() !== 'All') {
      params.push(targetEmpId.trim());
      whereConditions.push(`asg.employee_id = $${params.length}`);
    }

    // Asset filter
    const targetAssetId = asset_id || assetId;
    if (targetAssetId && targetAssetId.trim() && targetAssetId.trim() !== 'All') {
      params.push(targetAssetId.trim());
      whereConditions.push(`asg.asset_id = $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matching assignments
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM assignments asg
      JOIN assets a ON a.id = asg.asset_id
      JOIN employees e ON e.id = asg.employee_id
      ${whereClause}
    `;
    const countRes = await query(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    // Fetch paginated assignments with joined asset and employee metadata
    const listParams = [...params, limit, offset];
    const limitIdx = listParams.length - 1;
    const offsetIdx = listParams.length;

    const listSql = `
      SELECT 
        asg.id,
        asg.asset_id,
        asg.employee_id,
        asg.assigned_date,
        asg.expected_return_date,
        asg.returned_date,
        asg.notes,
        asg.status,
        asg.created_at,
        asg.updated_at,
        a.asset_code,
        a.asset_name,
        a.brand,
        a.model,
        a.serial_number,
        a.location,
        a.status AS asset_current_status,
        c.name AS category_name,
        e.employee_code,
        e.name AS employee_name,
        e.email AS employee_email,
        e.department,
        e.position,
        e.location AS employee_location,
        e.status AS employee_status
      FROM assignments asg
      JOIN assets a ON a.id = asg.asset_id
      JOIN categories c ON c.id = a.category_id
      JOIN employees e ON e.id = asg.employee_id
      ${whereClause}
      ORDER BY asg.assigned_date DESC, asg.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const result = await query(listSql, listParams);

    return success(res, {
      assignments: result.rows.map(formatAssignmentRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch assignments');
  }
}

/**
 * GET /api/assignments/:id
 * Retrieve a single assignment with full asset and employee details
 */
export async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        asg.id,
        asg.asset_id,
        asg.employee_id,
        asg.assigned_date,
        asg.expected_return_date,
        asg.returned_date,
        asg.notes,
        asg.status,
        asg.created_at,
        asg.updated_at,
        a.asset_code,
        a.asset_name,
        a.brand,
        a.model,
        a.serial_number,
        a.location,
        a.status AS asset_current_status,
        c.name AS category_name,
        e.employee_code,
        e.name AS employee_name,
        e.email AS employee_email,
        e.department,
        e.position,
        e.location AS employee_location,
        e.status AS employee_status
      FROM assignments asg
      JOIN assets a ON a.id = asg.asset_id
      JOIN categories c ON c.id = a.category_id
      JOIN employees e ON e.id = asg.employee_id
      WHERE asg.id = $1
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return notFound(res, `Assignment with ID '${id}' not found`);
    }

    return success(res, { assignment: formatAssignmentRow(result.rows[0]) });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch assignment details');
  }
}

/**
 * POST /api/assignments
 * Create an assignment with transaction, row lock, verification of asset & employee,
 * atomic status history creation, and concurrency-safe duplicate assignment prevention.
 */
export async function createAssignment(req, res) {
  const {
    id,
    assetId,
    asset_id,
    employeeId,
    employee_id,
    assignedDate,
    assigned_date,
    expectedReturnDate,
    expected_return_date,
    notes,
    actor,
  } = req.body;

  const targetAssetId = (assetId || asset_id)?.trim();
  const targetEmployeeId = (employeeId || employee_id)?.trim();
  const today = new Date().toISOString().split('T')[0];
  const checkoutDate = (assignedDate || assigned_date)?.trim() || today;
  const expReturnDate = (expectedReturnDate || expected_return_date)?.trim() || null;
  const cleanedNotes = notes ? notes.trim() : '';
  const realActor = actor && typeof actor === 'string' && actor.trim() ? actor.trim() : null;

  if (!targetAssetId || !targetEmployeeId) {
    return badRequest(res, 'Both assetId and employeeId are required to create an assignment');
  }

  if (checkoutDate && !isValidDate(checkoutDate)) {
    return badRequest(res, `Invalid assignedDate format: '${checkoutDate}'. Expected YYYY-MM-DD.`);
  }

  if (expReturnDate) {
    if (!isValidDate(expReturnDate)) {
      return badRequest(res, `Invalid expectedReturnDate format: '${expReturnDate}'. Expected YYYY-MM-DD.`);
    }
    if (expReturnDate < checkoutDate) {
      return badRequest(res, `Expected return date (${expReturnDate}) cannot be earlier than assigned date (${checkoutDate})`);
    }
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Lock asset row for update to guarantee concurrency safety
    const assetRes = await client.query('SELECT * FROM assets WHERE id = $1 FOR UPDATE', [targetAssetId]);
    if (assetRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return notFound(res, `Asset with ID '${targetAssetId}' not found`);
    }
    const asset = assetRes.rows[0];

    // Check asset status eligibility
    if (asset.status === 'Disposed') {
      await client.query('ROLLBACK');
      return badRequest(res, `Cannot assign disposed asset '${asset.asset_name}' (${asset.asset_code}). Decommissioned assets cannot be checked out.`);
    }

    if (asset.status === 'In Repair') {
      await client.query('ROLLBACK');
      return badRequest(res, `Cannot assign asset '${asset.asset_name}' (${asset.asset_code}) currently under repair or maintenance.`);
    }

    if (asset.status === 'Assigned' || asset.status === 'In Use' || asset.assigned_to_employee_id) {
      await client.query('ROLLBACK');
      return conflict(res, `Asset '${asset.asset_name}' (${asset.asset_code}) is already assigned to an employee.`);
    }

    // 2. Lock & verify employee
    const empRes = await client.query('SELECT * FROM employees WHERE id = $1', [targetEmployeeId]);
    if (empRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return notFound(res, `Employee with ID '${targetEmployeeId}' not found`);
    }
    const employee = empRes.rows[0];

    if (employee.status !== 'Active') {
      await client.query('ROLLBACK');
      return badRequest(res, `Cannot assign equipment to inactive employee '${employee.name}' (${employee.employee_code}). Employee must be Active.`);
    }

    // 3. Double-check for any existing active assignment on this asset (reinforced by partial unique index)
    const activeCheckRes = await client.query(
      `SELECT id FROM assignments WHERE asset_id = $1 AND status = 'Active' FOR UPDATE`,
      [targetAssetId]
    );
    if (activeCheckRes.rowCount > 0) {
      await client.query('ROLLBACK');
      return conflict(res, `Asset '${asset.asset_code}' already has an active assignment in progress.`);
    }

    // 4. Insert assignment record
    const assignmentId = id && typeof id === 'string' && id.trim()
      ? id.trim()
      : `asg-${crypto.randomUUID().slice(0, 8)}`;

    const insertAsgSql = `
      INSERT INTO assignments (
        id, asset_id, employee_id, assigned_date, expected_return_date, notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'Active')
      RETURNING *
    `;
    const asgInsertRes = await client.query(insertAsgSql, [
      assignmentId,
      targetAssetId,
      targetEmployeeId,
      checkoutDate,
      expReturnDate,
      cleanedNotes || null,
    ]);

    // 5. Update asset status to 'Assigned' and link employee
    await client.query(
      `UPDATE assets
       SET status = 'Assigned', assigned_to_employee_id = $2
       WHERE id = $1`,
      [targetAssetId, targetEmployeeId]
    );

    // 6. Record status history atomically
    const historyId = `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const historyReason = cleanedNotes
      ? `Assigned to ${employee.name} (${employee.employee_code}): ${cleanedNotes}`
      : `Assigned to ${employee.name} (${employee.employee_code})`;

    await client.query(
      `INSERT INTO asset_status_history (
        id, asset_id, previous_status, new_status, reason, actor, timestamp
      )
      VALUES ($1, $2, $3, 'Assigned', $4, $5, CURRENT_TIMESTAMP)`,
      [historyId, targetAssetId, asset.status, historyReason, realActor]
    );

    await client.query('COMMIT');

    const createdAssignment = {
      ...asgInsertRes.rows[0],
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      asset_current_status: 'Assigned',
      employee_code: employee.employee_code,
      employee_name: employee.name,
      employee_email: employee.email,
      department: employee.department,
    };

    return created(res, { assignment: formatAssignmentRow(createdAssignment) }, 'Asset assigned successfully');
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    return handleDatabaseError(err, res, 'Failed to create assignment');
  } finally {
    if (client) client.release();
  }
}

/**
 * POST /api/assignments/:id/return (and PATCH /api/assignments/:id/return)
 * Returns an active assignment, records actual return date, preserves history,
 * updates asset status consistently, and appends status history.
 */
export async function returnAssignment(req, res) {
  const { id } = req.params;
  const {
    returnedDate,
    returned_date,
    notes,
    returnNotes,
    return_notes,
    returnStatus,
    return_status,
    actor,
  } = req.body;

  const today = new Date().toISOString().split('T')[0];
  const actualReturnDate = (returnedDate || returned_date)?.trim() || today;
  const additionalNotes = (returnNotes || return_notes || notes)?.trim() || '';
  const requestedAssetStatus = (returnStatus || return_status)?.trim();
  const realActor = actor && typeof actor === 'string' && actor.trim() ? actor.trim() : null;

  if (actualReturnDate && !isValidDate(actualReturnDate)) {
    return badRequest(res, `Invalid returnedDate format: '${actualReturnDate}'. Expected YYYY-MM-DD.`);
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Lock assignment row
    const asgRes = await client.query('SELECT * FROM assignments WHERE id = $1 FOR UPDATE', [id]);
    if (asgRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return notFound(res, `Assignment with ID '${id}' not found`);
    }
    const assignment = asgRes.rows[0];

    // Prevent duplicate or repeated returns
    if (assignment.status === 'Returned') {
      await client.query('ROLLBACK');
      return conflict(res, `Assignment '${id}' has already been returned on ${assignment.returned_date || 'a previous date'}. Repeated return is not permitted.`);
    }

    if (actualReturnDate < assignment.assigned_date) {
      await client.query('ROLLBACK');
      return badRequest(res, `Return date (${actualReturnDate}) cannot be earlier than assigned date (${assignment.assigned_date}).`);
    }

    // 2. Lock asset row
    const assetRes = await client.query('SELECT * FROM assets WHERE id = $1 FOR UPDATE', [assignment.asset_id]);
    if (assetRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return notFound(res, `Referenced asset with ID '${assignment.asset_id}' not found`);
    }
    const asset = assetRes.rows[0];

    // Determine target asset status according to business rules:
    // "Returning an asset must not silently release it if another business rule says it remains under repair."
    let nextAssetStatus;
    if (asset.status === 'In Repair') {
      nextAssetStatus = 'In Repair';
    } else if (requestedAssetStatus === 'Returned') {
      nextAssetStatus = 'Returned';
    } else {
      nextAssetStatus = 'In Stock';
    }

    // 3. Update assignment record
    const mergedNotes = additionalNotes
      ? assignment.notes
        ? `${assignment.notes} | Return note: ${additionalNotes}`
        : `Return note: ${additionalNotes}`
      : assignment.notes;

    const updatedAsgRes = await client.query(
      `UPDATE assignments
       SET status = 'Returned', returned_date = $2, notes = $3
       WHERE id = $1
       RETURNING *`,
      [id, actualReturnDate, mergedNotes]
    );

    // 4. Update asset status & release assigned employee
    const updatedAssetRes = await client.query(
      `UPDATE assets
       SET status = $2, assigned_to_employee_id = NULL
       WHERE id = $1
       RETURNING *`,
      [assignment.asset_id, nextAssetStatus]
    );

    // 5. Append status history record
    const historyId = `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const historyReason = additionalNotes
      ? `Equipment returned (${nextAssetStatus}): ${additionalNotes}`
      : `Equipment returned from custodian assignment (${nextAssetStatus})`;

    await client.query(
      `INSERT INTO asset_status_history (
        id, asset_id, previous_status, new_status, reason, actor, timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [historyId, assignment.asset_id, asset.status, nextAssetStatus, historyReason, realActor]
    );

    await client.query('COMMIT');

    // Fetch joined employee & asset info for clean formatted response
    const fullAsgRes = await query(
      `SELECT 
        asg.*,
        a.asset_code, a.asset_name, a.brand, a.model, a.serial_number, a.location, a.status AS asset_current_status,
        c.name AS category_name,
        e.employee_code, e.name AS employee_name, e.email AS employee_email, e.department, e.position, e.status AS employee_status
       FROM assignments asg
       JOIN assets a ON a.id = asg.asset_id
       JOIN categories c ON c.id = a.category_id
       JOIN employees e ON e.id = asg.employee_id
       WHERE asg.id = $1`,
      [id]
    );

    return success(
      res,
      {
        assignment: formatAssignmentRow(fullAsgRes.rows[0] || updatedAsgRes.rows[0]),
        asset: {
          id: updatedAssetRes.rows[0].id,
          assetCode: updatedAssetRes.rows[0].asset_code,
          assetName: updatedAssetRes.rows[0].asset_name,
          status: updatedAssetRes.rows[0].status,
          assignedTo: null,
        },
      },
      'Asset returned successfully and inventory updated'
    );
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    return handleDatabaseError(err, res, 'Failed to process asset return');
  } finally {
    if (client) client.release();
  }
}

export default {
  getAssignments,
  getAssignmentById,
  createAssignment,
  returnAssignment,
};
