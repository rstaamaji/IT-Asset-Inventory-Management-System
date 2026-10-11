import { Router } from 'express';
import { testConnection } from '../config/db.js';

const router = Router();

/**
 * GET /api/health
 * Public health & database diagnostic probe.
 * Reports server status and database connectivity without exposing secrets.
 */
router.get('/health', async (req, res) => {
  const dbHealth = await testConnection();

  const isHealthy = dbHealth.ok;
  const statusCode = isHealthy ? 200 : 503;

  const responseBody = {
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'it-asset-management-api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: isHealthy ? 'connected' : 'disconnected',
      ...(isHealthy
        ? {
            latencyMs: dbHealth.latencyMs,
            serverVersion: dbHealth.version,
            dbTimestamp: dbHealth.timestamp,
          }
        : {
            message: 'Database connection failed. Verify PostgreSQL service and credentials.',
            error: dbHealth.error,
          }),
    },
  };

  return res.status(statusCode).json(responseBody);
});

export default router;
