const app = require('./app');
const env = require('./config/environment');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { initSlaBreachMonitor } = require('./jobs/slaBreachMonitor.job');
const logger = require('./utils/logger');

let server;

async function startServer() {
  try {
    if (env.NODE_ENV !== 'test') {
      await connectDatabase();
      initSlaBreachMonitor();
    }

    server = app.listen(env.PORT, () => {
      logger.info(`[Server] SentiTicket API Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`[Server] Client Origin allowed: ${env.CLIENT_ORIGIN}`);
    });
  } catch (error) {
    logger.error('[Server] Fatal error during startup:', { error: error.message });
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  logger.info(`[Server] ${signal} received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('[Server] HTTP server closed.');
      await disconnectDatabase();
      logger.info('[Server] Process exited cleanly.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[Server] Unhandled Rejection at Promise:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('[Server] Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
