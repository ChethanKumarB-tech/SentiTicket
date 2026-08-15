const express = require('express');
const cookieParser = require('cookie-parser');
const { corsMiddleware, helmetMiddleware } = require('./middleware/securityHeaders.middleware');
const { globalLimiter } = require('./middleware/rateLimiter.middleware');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');
const apiV1Router = require('./routes');
const logger = require('./utils/logger');

const app = express();

app.set('trust proxy', 1);

app.use(helmetMiddleware);
app.use(corsMiddleware);

app.use('/api', globalLimiter);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip
    });
  });
  next();
});

app.use('/api/v1', apiV1Router);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'HEALTHY',
    service: 'SentiTicket Node.js API Gateway',
    timestamp: new Date().toISOString()
  });
});

app.all('*', (req, res, next) => {
  next(AppError.notFound(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`));
});

app.use(errorHandler);

module.exports = app;
