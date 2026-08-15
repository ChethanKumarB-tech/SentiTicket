const cron = require('node-cron');
const { checkAllActiveSlaStates } = require('../services/sla.service');
const logger = require('../utils/logger');

let isRunning = false;

function initSlaBreachMonitor() {
  cron.schedule('*/1 * * * *', async () => {
    if (isRunning) {
      return;
    }

    try {
      isRunning = true;
      await checkAllActiveSlaStates();
    } catch (error) {
      logger.error('[SLA Monitor Daemon] Error during SLA evaluation run:', { error: error.message });
    } finally {
      isRunning = false;
    }
  });

  logger.info('[Jobs] SLA Breach Monitor scheduled (running every 60 seconds)');
}

module.exports = {
  initSlaBreachMonitor
};
