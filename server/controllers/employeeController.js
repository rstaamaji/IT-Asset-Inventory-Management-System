import crypto from 'crypto';
import { query } from '../config/db.js';
import { success, created, notFound, conflict, badRequest } from '../utils/apiResponse.js';
import { handleDatabaseError } from '../utils/dbErrors.js';
import { parsePagination, isValidEmail, ALLOWED_EMPLOYEE_STATUSES } from '../middleware/validate.js';

/**
 * Normalizes employee DB row to camelCase response matching frontend conventions
 */
function formatEmployeeRow(row) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    name: row.name,
    email: row.email,
    department: row.department,
    position: row.position,
    location: row.location,
    phone: row.phone || '',
    status: row.status,
    joinedDate: row.joined_date,
    assignedAssetCount: Number(row.assigned_asset_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/employees
 * List paginated employees with dynamic active assignment counts, department filter, status filter, and search
 */
export async function getEmployees(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { q, department, status } = req.query;

    const whereConditions = [];
    const params = [];

    if (q && q.trim()) {
      params.push(`%${q.trim()}%`);
      const idx = params.length;
      whereConditions.push(`(
        e.name ILIKE $${idx} OR
        e.employee_code ILIKE $${idx} OR
        e.email ILIKE $${idx} OR
        e.department ILIKE $${idx} OR
        e.position ILIKE $${idx} OR
        e.location ILIKE $${idx}
      )`);
    }

    if (department && department.trim() && department.trim() !== 'All') {
      params.push(department.trim());
      whereConditions.push(`e.department = $${params.length}`);
    }

    if (status && status.trim() && status.trim() !== 'All') {
      if (!ALLOWED_EMPLOYEE_STATUSES.includes(status.trim())) {
        return badRequest(res, `Invalid status filter. Allowed values: ${ALLOWED_EMPLOYEE_STATUSES.join(', ')}`);
      }
      params.push(status.trim());
      whereConditions.push(`e.status = $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total Count Query
    const countSql = `SELECT COUNT(*)::int AS total FROM employees e ${whereClause}`;
    const countRes = await query(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    // Data Query with dynamic count of currently active assignments
    const listParams = [...params, limit, offset];
    const limitIdx = listParams.length - 1;
    const offsetIdx = listParams.length;

    const listSql = `
      SELECT 
        e.id,
        e.employee_code,
        e.name,
        e.email,
        e.department,
        e.position,
        e.location,
        e.phone,
        e.status,
        e.joined_date,
        e.created_at,
        e.updated_at,
        COUNT(DISTINCT asg.id) FILTER (WHERE asg.status = 'Active')::int AS assigned_asset_count
      FROM employees e
      LEFT JOIN assignments asg ON asg.employee_id = e.id
      ${whereClause}
      GROUP BY e.id
      ORDER BY e.name ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const result = await query(listSql, listParams);

    return success(res, {
      employees: result.rows.map(formatEmployeeRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch employees');
  }
}

/**
 * GET /api/employees/:id
 * Retrieve a single employee by ID including active assigned assets
 */
export async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;

    const empSql = `
      SELECT 
        e.id,
        e.employee_code,
        e.name,
        e.email,
        e.department,
        e.position,
        e.location,
        e.phone,
        e.status,
        e.joined_date,
        e.created_at,
        e.updated_at,
        COUNT(DISTINCT asg.id) FILTER (WHERE asg.status = 'Active')::int AS assigned_asset_count
      FROM employees e
      LEFT JOIN assignments asg ON asg.employee_id = e.id
      WHERE e.id = $1
      GROUP BY e.id
    `;

    const empResult = await query(empSql, [id]);
    if (empResult.rowCount === 0) {
      return notFound(res, `Employee with ID '${id}' not found`);
    }

    // Fetch details of assets actively assigned to this employee
    const assignedAssetsSql = `
      SELECT 
        a.id,
        a.asset_code AS "assetCode",
        a.asset_name AS "assetName",
        a.brand,
        a.model,
        a.serial_number AS "serialNumber",
        a.status,
        asg.id AS "assignmentId",
        asg.assigned_date AS "assignedDate",
        asg.expected_return_date AS "expectedReturnDate",
        asg.notes
      FROM assignments asg
      JOIN assets a ON a.id = asg.asset_id
      WHERE asg.employee_id = $1 AND asg.status = 'Active'
      ORDER BY asg.assigned_date DESC
    `;
    const assetsRes = await query(assignedAssetsSql, [id]);

    const employee = {
      ...formatEmployeeRow(empResult.rows[0]),
      assignedAssets: assetsRes.rows,
    };

    return success(res, { employee });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch employee details');
  }
}

/**
 * POST /api/employees
 * Create a new employee with unique code and email validation
 */
export async function createEmployee(req, res) {
  try {
    const {
      id,
      employeeCode,
      employee_code,
      name,
      email,
      department,
      position,
      location,
      phone,
      status,
      joinedDate,
      joined_date,
    } = req.body;

    const code = (employeeCode || employee_code)?.trim();
    const empName = name?.trim();
    const empEmail = email?.trim();
    const empDept = department?.trim();
    const empPos = position?.trim();
    const empLoc = location?.trim();
    const empStatus = status ? status.trim() : 'Active';
    const empJoined = joinedDate || joined_date || new Date().toISOString().split('T')[0];

    // Validate required fields
    if (!code || !empName || !empEmail || !empDept || !empPos || !empLoc) {
      return badRequest(res, 'Missing required fields: employeeCode, name, email, department, position, location');
    }

    if (!isValidEmail(empEmail)) {
      return badRequest(res, `Invalid email address format: '${empEmail}'`);
    }

    if (!ALLOWED_EMPLOYEE_STATUSES.includes(empStatus)) {
      return badRequest(res, `Invalid status '${empStatus}'. Must be one of: ${ALLOWED_EMPLOYEE_STATUSES.join(', ')}`);
    }

    const employeeId = id && typeof id === 'string' && id.trim()
      ? id.trim()
      : `emp-${crypto.randomUUID().slice(0, 8)}`;

    const insertSql = `
      INSERT INTO employees (
        id, employee_code, name, email, department, position, location, phone, status, joined_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(insertSql, [
      employeeId,
      code,
      empName,
      empEmail,
      empDept,
      empPos,
      empLoc,
      phone ? phone.trim() : null,
      empStatus,
      empJoined,
    ]);

    const createdRecord = formatEmployeeRow({
      ...result.rows[0],
      assigned_asset_count: 0,
    });

    return created(res, { employee: createdRecord }, 'Employee created successfully');
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to create employee');
  }
}

/**
 * PUT /api/employees/:id
 * Update an existing employee
 */
export async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    const {
      employeeCode,
      employee_code,
      name,
      email,
      department,
      position,
      location,
      phone,
      status,
      joinedDate,
      joined_date,
    } = req.body;

    // Check if employee exists
    const checkRes = await query('SELECT * FROM employees WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return notFound(res, `Employee with ID '${id}' not found`);
    }

    const current = checkRes.rows[0];

    const code = employeeCode || employee_code;
    if (code !== undefined && !code.trim()) {
      return badRequest(res, 'employeeCode cannot be empty');
    }

    if (email !== undefined) {
      if (!email.trim() || !isValidEmail(email.trim())) {
        return badRequest(res, `Invalid email address format: '${email}'`);
      }
    }

    const targetStatus = status !== undefined ? status.trim() : current.status;
    if (status !== undefined && !ALLOWED_EMPLOYEE_STATUSES.includes(targetStatus)) {
      return badRequest(res, `Invalid status '${status}'. Must be one of: ${ALLOWED_EMPLOYEE_STATUSES.join(', ')}`);
    }

    const updateSql = `
      UPDATE employees
      SET
        employee_code = COALESCE($2, employee_code),
        name = COALESCE($3, name),
        email = COALESCE($4, email),
        department = COALESCE($5, department),
        position = COALESCE($6, position),
        location = COALESCE($7, location),
        phone = COALESCE($8, phone),
        status = COALESCE($9, status),
        joined_date = COALESCE($10, joined_date)
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(updateSql, [
      id,
      code ? code.trim() : null,
      name !== undefined ? name.trim() : null,
      email !== undefined ? email.trim() : null,
      department !== undefined ? department.trim() : null,
      position !== undefined ? position.trim() : null,
      location !== undefined ? location.trim() : null,
      phone !== undefined ? phone.trim() : null,
      status !== undefined ? status.trim() : null,
      joinedDate || joined_date || null,
    ]);

    // Dynamic count of active assigned assets
    const countRes = await query(
      `SELECT COUNT(*)::int AS count FROM assignments WHERE employee_id = $1 AND status = 'Active'`,
      [id]
    );
    const assignedCount = countRes.rows[0]?.count || 0;

    const updatedRecord = formatEmployeeRow({
      ...result.rows[0],
      assigned_asset_count: assignedCount,
    });

    return success(res, { employee: updatedRecord }, 'Employee updated successfully');
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to update employee');
  }
}

/**
 * DELETE /api/employees/:id
 * Safe deletion of an employee with active and historical assignment protection
 */
export async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;

    // Check employee existence
    const empRes = await query('SELECT id, name, employee_code FROM employees WHERE id = $1', [id]);
    if (empRes.rowCount === 0) {
      return notFound(res, `Employee with ID '${id}' not found`);
    }
    const emp = empRes.rows[0];

    // 1. Check if employee has active assignments
    const activeRes = await query(
      `SELECT COUNT(*)::int AS active_count FROM assignments WHERE employee_id = $1 AND status = 'Active'`,
      [id]
    );
    if (activeRes.rows[0].active_count > 0) {
      return conflict(
        res,
        `Cannot delete employee "${emp.name}" (${emp.employee_code}) because they currently have ${activeRes.rows[0].active_count} active asset assignment(s). Please return all assigned assets before deleting.`
      );
    }

    // 2. Check if employee is currently assigned on any asset record
    const assetRefRes = await query(
      `SELECT COUNT(*)::int AS ref_count FROM assets WHERE assigned_to_employee_id = $1`,
      [id]
    );
    if (assetRefRes.rows[0].ref_count > 0) {
      return conflict(
        res,
        `Cannot delete employee "${emp.name}" because they are currently designated as the assigned user on ${assetRefRes.rows[0].ref_count} asset(s). Reassign or unassign those assets first.`
      );
    }

    // 3. Check if employee has historical assignment records (preserving enterprise audit trail)
    const historyRes = await query(
      `SELECT COUNT(*)::int AS history_count FROM assignments WHERE employee_id = $1`,
      [id]
    );
    if (historyRes.rows[0].history_count > 0) {
      return conflict(
        res,
        `Cannot delete employee "${emp.name}" because they have ${historyRes.rows[0].history_count} historical assignment record(s). To preserve audit trails, set the employee status to 'Inactive' instead of deleting.`
      );
    }

    // Safe deletion: no references exist
    await query('DELETE FROM employees WHERE id = $1', [id]);

    return success(res, null, `Employee "${emp.name}" deleted successfully`);
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to delete employee');
  }
}

export default {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
