import dotenv from 'dotenv';
import app from './app.js';
import { testConnection, pool } from './config/db.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  console.log('====================================================');
  console.log('IT Asset & Inventory Management - Backend Server');
  console.log('====================================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Test PostgreSQL connection on startup
  console.log('Testing PostgreSQL connectivity...');
  const dbHealth = await testConnection();

  if (dbHealth.ok) {
    console.log(`✓ PostgreSQL connected successfully (${dbHealth.latencyMs}ms)`);
    console.log(`  Version: ${dbHealth.version}`);
  } else {
    console.warn('⚠️  PostgreSQL connection could not be established:');
    console.warn(`   ${dbHealth.error}`);
    console.warn('   Ensure PostgreSQL is running and credentials in .env are correct.');
    console.warn('   (The server will still run and report status at /api/health)');
  }

  const server = app.listen(PORT, () => {
    console.log(`✓ API Server listening on http://localhost:${PORT}`);
    console.log(`✓ Health endpoint: http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await pool.end();
        console.log('Database connection pool drained.');
      } catch (err) {
        console.error('Error draining database pool:', err.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
