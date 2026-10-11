import { query } from '../config/db.js';
import { success } from '../utils/apiResponse.js';
import { handleDatabaseError } from '../utils/dbErrors.js';

/**
 * GET /api/dashboard/stats
 * Provides accurate server-side aggregation metrics for the enterprise dashboard
 */
export async function getDashboardStats(req, res) {
  try {
    // 1. Asset status aggregates
    const assetStatsSql = `
      SELECT
        COUNT(*)::int AS total_assets,
        COUNT(*) FILTER (WHERE status IN ('In Stock', 'Returned'))::int AS available_count,
        COUNT(*) FILTER (WHERE status IN ('Assigned', 'In Use'))::int AS assigned_count,
        COUNT(*) FILTER (WHERE status = 'In Repair')::int AS in_repair_count,
        COUNT(*) FILTER (WHERE status = 'Disposed')::int AS disposed_count,
        COALESCE(SUM(purchase_price), 0)::numeric AS total_inventory_value
      FROM assets
    `;
    const assetStatsRes = await query(assetStatsSql);
    const assetStats = assetStatsRes.rows[0];

    // 2. Auxiliary counts
    const countsSql = `
      SELECT
        (SELECT COUNT(*)::int FROM categories) AS total_categories,
        (SELECT COUNT(*)::int FROM employees) AS total_employees,
        (SELECT COUNT(*)::int FROM assignments WHERE status = 'Active') AS active_assignments
    `;
    const countsRes = await query(countsSql);
    const counts = countsRes.rows[0];

    // 3. Category distribution
    const catDistSql = `
      SELECT 
        c.id,
        c.name,
        COUNT(a.id)::int AS count
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC, c.name ASC
    `;
    const catDistRes = await query(catDistSql);

    // 4. Status distribution
    const statusDistSql = `
      SELECT status, COUNT(*)::int AS count
      FROM assets
      GROUP BY status
      ORDER BY count DESC
    `;
    const statusDistRes = await query(statusDistSql);

    // 5. Recent audit activities
    const recentSql = `
      SELECT 
        sh.id,
        sh.asset_id AS "assetId",
        a.asset_code AS "assetCode",
        a.asset_name AS "assetName",
        sh.previous_status AS "previousStatus",
        sh.new_status AS "newStatus",
        sh.reason,
        sh.actor,
        sh.timestamp
      FROM asset_status_history sh
      JOIN assets a ON a.id = sh.asset_id
      ORDER BY sh.timestamp DESC
      LIMIT 10
    `;
    const recentRes = await query(recentSql);

    const data = {
      totalAssets: assetStats.total_assets || 0,
      availableCount: assetStats.available_count || 0,
      assignedCount: assetStats.assigned_count || 0,
      inRepairCount: assetStats.in_repair_count || 0,
      disposedCount: assetStats.disposed_count || 0,
      totalInventoryValue: Number(assetStats.total_inventory_value || 0),
      totalCategories: counts.total_categories || 0,
      totalEmployees: counts.total_employees || 0,
      activeAssignments: counts.active_assignments || 0,
      categoryDistribution: catDistRes.rows,
      statusDistribution: statusDistRes.rows,
      recentActivities: recentRes.rows,
    };

    return success(res, { stats: data });
  } catch (err) {
    return handleDatabaseError(err, res, 'Failed to fetch dashboard statistics');
  }
}

export default {
  getDashboardStats,
};
