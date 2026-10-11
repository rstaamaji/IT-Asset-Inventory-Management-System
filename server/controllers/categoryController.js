import crypto from 'crypto';
import { query } from '../config/db.js';
import { success, created, notFound, conflict, badRequest } from '../utils/apiResponse.js';
import { handleDatabaseError } from '../utils/dbErrors.js';

/**
 * GET /api/categories
 * List all categories with dynamic asset count and optional search query 'q'
 */
export async function getCategories(req, res) {
  try {
    const { q } = req.query;
    let sql = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COUNT(a.id)::int AS "assetCount"
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
    `;
    const params = [];

    if (q && q.trim()) {
      sql += ` WHERE c.name ILIKE $1 OR c.description ILIKE $1 `;
      params.push(`%${q.trim()}%`);
    }

    sql += ` GROUP BY c.id ORDER BY c.name ASC `;

    const result = await query(sql, params);

    return success(res, {
      categories: result.rows,
      total: result.rowCount,
    });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch categories');
  }
}

/**
 * GET /api/categories/:id
 * Retrieve a single category by ID with its dynamic asset count
 */
export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COUNT(a.id)::int AS "assetCount"
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    const result = await query(sql, [id]);

    if (result.rowCount === 0) {
      return notFound(res, `Category with ID '${id}' not found`);
    }

    return success(res, { category: result.rows[0] });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch category details');
  }
}

/**
 * POST /api/categories
 * Create a new category with unique name validation
 */
export async function createCategory(req, res) {
  try {
    const { id, name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return badRequest(res, 'Category name is required and cannot be empty');
    }

    const categoryId = id && typeof id === 'string' && id.trim()
      ? id.trim()
      : `cat-${crypto.randomUUID().slice(0, 8)}`;

    const sql = `
      INSERT INTO categories (id, name, description)
      VALUES ($1, $2, $3)
      RETURNING 
        id, 
        name, 
        description, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
    `;

    const result = await query(sql, [
      categoryId,
      name.trim(),
      description ? description.trim() : '',
    ]);

    const createdRecord = {
      ...result.rows[0],
      assetCount: 0,
    };

    return created(res, { category: createdRecord }, 'Category created successfully');
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to create category');
  }
}

/**
 * PUT /api/categories/:id
 * Update an existing category
 */
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const checkRes = await query('SELECT id FROM categories WHERE id = $1', [id]);
    if (checkRes.rowCount === 0) {
      return notFound(res, `Category with ID '${id}' not found`);
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return badRequest(res, 'Category name cannot be empty');
    }

    const sql = `
      UPDATE categories
      SET 
        name = COALESCE($2, name),
        description = COALESCE($3, description)
      WHERE id = $1
      RETURNING 
        id, 
        name, 
        description, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt"
    `;

    const result = await query(sql, [
      id,
      name !== undefined ? name.trim() : null,
      description !== undefined ? description.trim() : null,
    ]);

    // Fetch dynamic asset count
    const countRes = await query('SELECT COUNT(*)::int AS count FROM assets WHERE category_id = $1', [id]);
    const assetCount = countRes.rows[0]?.count || 0;

    return success(
      res,
      { category: { ...result.rows[0], assetCount } },
      'Category updated successfully'
    );
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to update category');
  }
}

/**
 * DELETE /api/categories/:id
 * Delete category with foreign key / reference check
 */
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Check if category exists and count how many assets belong to it
    const checkSql = `
      SELECT 
        c.id, 
        c.name, 
        COUNT(a.id)::int AS "assetCount"
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    const checkRes = await query(checkSql, [id]);

    if (checkRes.rowCount === 0) {
      return notFound(res, `Category with ID '${id}' not found`);
    }

    const cat = checkRes.rows[0];
    if (cat.assetCount > 0) {
      return conflict(
        res,
        `Cannot delete category "${cat.name}" because it is currently assigned to ${cat.assetCount} asset(s). Reassign or remove these assets before deleting.`
      );
    }

    await query('DELETE FROM categories WHERE id = $1', [id]);

    return success(res, null, `Category "${cat.name}" deleted successfully`);
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to delete category');
  }
}

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
