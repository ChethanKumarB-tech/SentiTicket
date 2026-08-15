const mongoose = require('mongoose');
const env = require('./environment');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDatabase() {
  if (isConnected) {
    return;
  }

  const options = {
    autoIndex: env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    isConnected = true;
    logger.info(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error('[Database] Failed to connect to MongoDB', { error: error.message });
    if (env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

async function disconnectDatabase() {
  if (!isConnected) {
    return;
  }
  await mongoose.disconnect();
  isConnected = false;
  logger.info('[Database] MongoDB disconnected cleanly');
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('[Database] MongoDB connection lost');
});

mongoose.connection.on('error', (err) => {
  logger.error('[Database] MongoDB connection error event', { error: err.message });
});

module.exports = {
  connectDatabase,
  disconnectDatabase
};
