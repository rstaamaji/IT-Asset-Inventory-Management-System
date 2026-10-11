import crypto from 'crypto';
import { pool, query } from '../config/db.js';
import { success, created, notFound, conflict, badRequest } from '../utils/apiResponse.js';
import { handleDatabaseError } from '../utils/dbErrors.js';
import { parsePagination, ALLOWED_ASSET_STATUSES } from '../middleware/validate.js';

/**
 * Normalizes asset database row into camelCase API response
 */
function formatAssetRow(row) {
  return {
    id: row.id,
    assetCode: row.asset_code,
    assetName: row.asset_name,
    categoryId: row.category_id,
    category: row.category_name || '',
    brand: row.brand,
    model: row.model || '—',
    serialNumber: row.serial_number,
    purchaseDate: row.purchase_date,
    purchasePrice: Number(row.purchase_price || 0),
    warrantyEnd: row.warranty_end || '—',
    location: row.location,
    status: row.status,
    assignedTo: row.assigned_to_employee_id
      ? {
          id: row.assigned_to_employee_id,
          name: row.assigned_to_name || '',
          employeeCode: row.assigned_to_code || '',
          email: row.assigned_to_email || '',
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * GET /api/assets
 * Paginated assets list with search, status, category, and department filters
 */
export async function getAssets(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { q, status, category, category_id, department } = req.query;

    const whereConditions = [];
    const params = [];

    // Search query
    if (q && q.trim()) {
      params.push(`%${q.trim()}%`);
      const idx = params.length;
      whereConditions.push(`(
        a.asset_code ILIKE $${idx} OR
        a.asset_name ILIKE $${idx} OR
        a.brand ILIKE $${idx} OR
        a.model ILIKE $${idx} OR
        a.serial_number ILIKE $${idx} OR
        a.location ILIKE $${idx}
      )`);
    }

    // Status filter
    if (status && status.trim() && status.trim() !== 'All') {
      if (!ALLOWED_ASSET_STATUSES.includes(status.trim())) {
        return badRequest(res, `Invalid status filter. Allowed values: ${ALLOWED_ASSET_STATUSES.join(', ')}`);
      }
      params.push(status.trim());
      whereConditions.push(`a.status = $${params.length}`);
    }

    // Category filter (accepts category id or name)
    const catFilter = category_id || category;
    if (catFilter && catFilter.trim() && catFilter.trim() !== 'All') {
      params.push(catFilter.trim());
      const idx = params.length;
      whereConditions.push(`(a.category_id = $${idx} OR c.name ILIKE $${idx})`);
    }

    // Department filter
    if (department && department.trim() && department.trim() !== 'All') {
      params.push(department.trim());
      whereConditions.push(`e.department = $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matching items
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM assets a
      JOIN categories c ON c.id = a.category_id
      LEFT JOIN employees e ON e.id = a.assigned_to_employee_id
      ${whereClause}
    `;
    const countRes = await query(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    // Fetch paginated data
    const listParams = [...params, limit, offset];
    const limitIdx = listParams.length - 1;
    const offsetIdx = listParams.length;

    const listSql = `
      SELECT 
        a.id,
        a.asset_code,
        a.asset_name,
        a.category_id,
        c.name AS category_name,
        a.brand,
        a.model,
        a.serial_number,
        a.purchase_date,
        a.purchase_price,
        a.warranty_end,
        a.location,
        a.status,
        a.assigned_to_employee_id,
        e.name AS assigned_to_name,
        e.employee_code AS assigned_to_code,
        e.email AS assigned_to_email,
        a.created_at,
        a.updated_at
      FROM assets a
      JOIN categories c ON c.id = a.category_id
      LEFT JOIN employees e ON e.id = a.assigned_to_employee_id
      ${whereClause}
      ORDER BY a.asset_code ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const result = await query(listSql, listParams);

    return success(res, {
      assets: result.rows.map(formatAssetRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch assets');
  }
}

/**
 * GET /api/assets/:id
 * Retrieve a single asset with full details, active assignment, and status history timeline
 */
export async function getAssetById(req, res) {
  try {
    const { id } = req.params;

    const assetSql = `
      SELECT 
        a.id,
        a.asset_code,
        a.asset_name,
        a.category_id,
        c.name AS category_name,
        c.description AS category_description,
        a.brand,
        a.model,
        a.serial_number,
        a.purchase_date,
        a.purchase_price,
        a.warranty_end,
        a.location,
        a.status,
        a.assigned_to_employee_id,
        e.name AS assigned_to_name,
        e.employee_code AS assigned_to_code,
        e.email AS assigned_to_email,
        e.department AS assigned_to_department,
        e.position AS assigned_to_position,
        a.created_at,
        a.updated_at
      FROM assets a
      JOIN categories c ON c.id = a.category_id
      LEFT JOIN employees e ON e.id = a.assigned_to_employee_id
      WHERE a.id = $1
    `;

    const assetRes = await query(assetSql, [id]);
    if (assetRes.rowCount === 0) {
      return notFound(res, `Asset with ID '${id}' not found`);
    }

    // Status History Timeline
    const historySql = `
      SELECT 
        id,
        previous_status AS "previousStatus",
        new_status AS "newStatus",
        reason,
        actor,
        timestamp
      FROM asset_status_history
      WHERE asset_id = $1
      ORDER BY timestamp DESC
    `;
    const historyRes = await query(historySql, [id]);

    // Active assignment details (if any)
    const activeAsgSql = `
      SELECT 
        asg.id,
        asg.employee_id AS "employeeId",
        e.name AS "employeeName",
        e.employee_code AS "employeeCode",
        asg.assigned_date AS "assignedDate",
        asg.expected_return_date AS "expectedReturnDate",
        asg.notes
      FROM assignments asg
      JOIN employees e ON e.id = asg.employee_id
      WHERE asg.asset_id = $1 AND asg.status = 'Active'
      LIMIT 1
    `;
    const asgRes = await query(activeAsgSql, [id]);

    const asset = {
      ...formatAssetRow(assetRes.rows[0]),
      statusHistory: historyRes.rows,
      activeAssignment: asgRes.rows[0] || null,
    };

    return success(res, { asset });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch asset details');
  }
}

/**
 * POST /api/assets
 * Create a new asset with category validation and automatic initial status history logging
 */
export async function createAsset(req, res) {
  const {
    id,
    assetCode,
    asset_code,
    assetName,
    asset_name,
    categoryId,
    category_id,
    category,
    brand,
    model,
    serialNumber,
    serial_number,
    purchaseDate,
    purchase_date,
    purchasePrice,
    purchase_price,
    warrantyEnd,
    warranty_end,
    location,
    status,
    assignedToEmployeeId,
    assigned_to_employee_id,
  } = req.body;

  const code = (assetCode || asset_code)?.trim();
  const name = (assetName || asset_name)?.trim();
  const br = brand?.trim();
  const sn = (serialNumber || serial_number)?.trim();
  const loc = location?.trim();
  let catId = (categoryId || category_id)?.trim();
  const targetStatus = status ? status.trim() : 'In Stock';

  if (!code || !name || !br || !sn || !loc) {
    return badRequest(res, 'Missing required fields: assetCode, assetName, brand, serialNumber, location');
  }

  if (!ALLOWED_ASSET_STATUSES.includes(targetStatus)) {
    return badRequest(res, `Invalid status '${targetStatus}'. Allowed: ${ALLOWED_ASSET_STATUSES.join(', ')}`);
  }

  const price = purchasePrice !== undefined ? Number(purchasePrice) : purchase_price !== undefined ? Number(purchase_price) : 0;
  if (isNaN(price) || price < 0) {
    return badRequest(res, 'Purchase price must be a valid non-negative number');
  }

  let client;
  try {
    client = await pool.connect();

    // Resolve categoryId if category name was provided instead
    if (!catId && category) {
      const catLookup = await client.query('SELECT id FROM categories WHERE name ILIKE $1 LIMIT 1', [category.trim()]);
      if (catLookup.rowCount > 0) {
        catId = catLookup.rows[0].id;
      }
    }

    if (!catId) {
      return badRequest(res, 'A valid categoryId or category name is required');
    }

    // Verify category exists
    const catCheck = await client.query('SELECT id, name FROM categories WHERE id = $1', [catId]);
    if (catCheck.rowCount === 0) {
      return badRequest(res, `Category with ID '${catId}' does not exist`);
    }

    const price = purchasePrice !== undefined ? Number(purchasePrice) : purchase_price !== undefined ? Number(purchase_price) : 0;
    if (isNaN(price) || price < 0) {
      return badRequest(res, 'Purchase price must be a valid non-negative number');
    }

    const assignedEmpId = assignedToEmployeeId || assigned_to_employee_id || null;
    if (assignedEmpId) {
      const empCheck = await client.query('SELECT id FROM employees WHERE id = $1', [assignedEmpId]);
      if (empCheck.rowCount === 0) {
        return badRequest(res, `Assigned employee with ID '${assignedEmpId}' does not exist`);
      }
    }

    const assetId = id && typeof id === 'string' && id.trim()
      ? id.trim()
      : `ast-${crypto.randomUUID().slice(0, 8)}`;

    const pDate = purchaseDate || purchase_date || new Date().toISOString().split('T')[0];
    const wEnd = warrantyEnd || warranty_end || null;
    const cleanWEnd = wEnd && wEnd !== '—' ? wEnd : null;

    await client.query('BEGIN');

    // 1. Insert Asset
    const insertSql = `
      INSERT INTO assets (
        id, asset_code, asset_name, category_id, brand, model,
        serial_number, purchase_date, purchase_price, warranty_end,
        location, status, assigned_to_employee_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const assetRes = await client.query(insertSql, [
      assetId,
      code,
      name,
      catId,
      br,
      model ? model.trim() : '—',
      sn,
      pDate,
      price,
      cleanWEnd,
      loc,
      targetStatus,
      assignedEmpId,
    ]);

    // 2. Insert initial asset status history entry
    const historyId = `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await client.query(
      `INSERT INTO asset_status_history (id, asset_id, previous_status, new_status, reason, actor, timestamp)
       VALUES ($1, $2, NULL, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [historyId, assetId, targetStatus, 'Initial asset registration', 'System']
    );

    await client.query('COMMIT');

    const createdRecord = formatAssetRow({
      ...assetRes.rows[0],
      category_name: catCheck.rows[0].name,
    });

    return created(res, { asset: createdRecord }, 'Asset registered successfully');
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    return handleDatabaseError(err, res, 'Failed to create asset');
  } finally {
    if (client) client.release();
  }
}

/**
 * PUT /api/assets/:id
 * Update an existing asset with lifecycle status transition validation and audit logging
 */
export async function updateAsset(req, res) {
  const { id } = req.params;
  const {
    assetCode,
    asset_code,
    assetName,
    asset_name,
    categoryId,
    category_id,
    brand,
    model,
    serialNumber,
    serial_number,
    purchaseDate,
    purchase_date,
    purchasePrice,
    purchase_price,
    warrantyEnd,
    warranty_end,
    location,
    status,
    assignedToEmployeeId,
    assigned_to_employee_id,
    reason,
    actor,
  } = req.body;

  if (status !== undefined && !ALLOWED_ASSET_STATUSES.includes(status.trim())) {
    return badRequest(res, `Invalid status '${status}'. Allowed: ${ALLOWED_ASSET_STATUSES.join(', ')}`);
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Fetch current asset state
    const currentRes = await client.query('SELECT * FROM assets WHERE id = $1 FOR UPDATE', [id]);
    if (currentRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return notFound(res, `Asset with ID '${id}' not found`);
    }

    const current = currentRes.rows[0];
    const newStatus = status ? status.trim() : current.status;

    // 2. Validate Lifecycle Status Transitions
    if (current.status === 'Disposed' && newStatus !== 'Disposed') {
      await client.query('ROLLBACK');
      return badRequest(res, 'Disposed assets cannot be transitioned back to operational status');
    }

    // Active assignment check
    const activeAsgCheck = await client.query(
      `SELECT COUNT(*)::int AS count FROM assignments WHERE asset_id = $1 AND status = 'Active'`,
      [id]
    );
    const hasActiveAssignment = activeAsgCheck.rows[0].count > 0;

    if (newStatus === 'Disposed' && (hasActiveAssignment || current.assigned_to_employee_id)) {
      await client.query('ROLLBACK');
      return conflict(
        res,
        'Cannot mark asset as Disposed while it has an active employee assignment. Return or revoke the assignment first.'
      );
    }

    if (newStatus === 'In Repair' && hasActiveAssignment) {
      await client.query('ROLLBACK');
      return conflict(
        res,
        'Cannot place asset in repair while actively assigned to an employee. Return the asset first.'
      );
    }

    // Validate category if updating category_id
    const targetCatId = categoryId || category_id;
    if (targetCatId) {
      const catCheck = await client.query('SELECT id FROM categories WHERE id = $1', [targetCatId]);
      if (catCheck.rowCount === 0) {
        await client.query('ROLLBACK');
        return badRequest(res, `Category with ID '${targetCatId}' does not exist`);
      }
    }

    // Validate employee if updating assigned_to_employee_id
    const targetEmpId = assignedToEmployeeId !== undefined ? assignedToEmployeeId : assigned_to_employee_id;
    if (targetEmpId) {
      const empCheck = await client.query('SELECT id FROM employees WHERE id = $1', [targetEmpId]);
      if (empCheck.rowCount === 0) {
        await client.query('ROLLBACK');
        return badRequest(res, `Employee with ID '${targetEmpId}' does not exist`);
      }
    }

    // 3. Log status change to asset_status_history if status changed
    if (newStatus !== current.status) {
      const historyId = `sh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await client.query(
        `INSERT INTO asset_status_history (id, asset_id, previous_status, new_status, reason, actor, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [
          historyId,
          id,
          current.status,
          newStatus,
          reason ? reason.trim() : 'Asset status modified via API',
          actor ? actor.trim() : 'System',
        ]
      );
    }

    // 4. Update asset
    const priceVal = purchasePrice !== undefined ? purchasePrice : purchase_price;
    const cleanWEnd = warrantyEnd !== undefined ? (warrantyEnd === '—' ? null : warrantyEnd) : warranty_end !== undefined ? (warranty_end === '—' ? null : warranty_end) : undefined;

    const updateSql = `
      UPDATE assets
      SET
        asset_code = COALESCE($2, asset_code),
        asset_name = COALESCE($3, asset_name),
        category_id = COALESCE($4, category_id),
        brand = COALESCE($5, brand),
        model = COALESCE($6, model),
        serial_number = COALESCE($7, serial_number),
        purchase_date = COALESCE($8, purchase_date),
        purchase_price = COALESCE($9, purchase_price),
        warranty_end = CASE WHEN $10::boolean THEN $11::date ELSE warranty_end END,
        location = COALESCE($12, location),
        status = COALESCE($13, status),
        assigned_to_employee_id = CASE WHEN $14::boolean THEN $15 ELSE assigned_to_employee_id END
      WHERE id = $1
      RETURNING *
    `;

    const updateRes = await client.query(updateSql, [
      id,
      assetCode || asset_code || null,
      assetName || asset_name || null,
      targetCatId || null,
      brand || null,
      model || null,
      serialNumber || serial_number || null,
      purchaseDate || purchase_date || null,
      priceVal !== undefined ? Number(priceVal) : null,
      cleanWEnd !== undefined,
      cleanWEnd || null,
      location || null,
      newStatus,
      targetEmpId !== undefined,
      targetEmpId || null,
    ]);

    // Fetch joined category and employee names for clean response
    const fetchJoined = await client.query(
      `SELECT c.name AS category_name, e.name AS assigned_to_name, e.employee_code AS assigned_to_code, e.email AS assigned_to_email
       FROM assets a
       JOIN categories c ON c.id = a.category_id
       LEFT JOIN employees e ON e.id = a.assigned_to_employee_id
       WHERE a.id = $1`,
      [id]
    );

    await client.query('COMMIT');

    const updatedRecord = formatAssetRow({
      ...updateRes.rows[0],
      category_name: fetchJoined.rows[0]?.category_name,
      assigned_to_name: fetchJoined.rows[0]?.assigned_to_name,
      assigned_to_code: fetchJoined.rows[0]?.assigned_to_code,
      assigned_to_email: fetchJoined.rows[0]?.assigned_to_email,
    });

    return success(res, { asset: updatedRecord }, 'Asset updated successfully');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return handleDatabaseError(err, res, 'Failed to update asset');
  } finally {
    client.release();
  }
}

/**
 * DELETE /api/assets/:id
 * Delete asset safely: blocked if assignment records exist
 */
export async function deleteAsset(req, res) {
  let client;
  try {
    const { id } = req.params;
    client = await pool.connect();

    // 1. Check existence
    const checkRes = await client.query('SELECT id, asset_code, asset_name FROM assets WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return notFound(res, `Asset with ID '${id}' not found`);
    }
    const asset = checkRes.rows[0];

    // 2. Check assignment history
    const asgRes = await client.query('SELECT COUNT(*)::int AS count FROM assignments WHERE asset_id = $1', [id]);
    const asgCount = asgRes.rows[0].count;

    if (asgCount > 0) {
      return conflict(
        res,
        `Cannot delete asset "${asset.asset_name}" (${asset.asset_code}) because it has ${asgCount} assignment record(s) on file. Enterprise compliance requires preserving historical assignments; mark the asset as 'Disposed' instead.`
      );
    }

    await client.query('BEGIN');

    // 3. Delete status history records
    await client.query('DELETE FROM asset_status_history WHERE asset_id = $1', [id]);

    // 4. Delete asset
    await client.query('DELETE FROM assets WHERE id = $1', [id]);

    await client.query('COMMIT');

    return success(res, null, `Asset "${asset.asset_name}" deleted successfully`);
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    return handleDatabaseError(err, res, 'Failed to delete asset');
  } finally {
    if (client) client.release();
  }
}

export default {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
