const { ZodError } = require('zod');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const env = require('../config/environment');

function normalizeError(err) {
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
    return new AppError('Validation failed for one or more fields', 422, 'VALIDATION_ERROR', formattedIssues);
  }

  if (err.name === 'CastError') {
    return new AppError(`Invalid format for field: ${err.path}`, 400, 'INVALID_RESOURCE_ID');
  }

  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {}).join(', ');
    return new AppError(`A record with this ${duplicateFields || 'field'} already exists`, 409, 'DUPLICATE_ENTRY');
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    return new AppError('Database validation error', 422, 'SCHEMA_VALIDATION_ERROR', errors);
  }

  if (err.name === 'JsonWebTokenError') {
    return new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Authentication token has expired', 401, 'TOKEN_EXPIRED');
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('Uploaded file exceeds maximum allowed size of 10MB', 413, 'FILE_TOO_LARGE');
  }

  return err;
}

function errorHandler(err, req, res, next) {
  const normalizedErr = normalizeError(err);

  const statusCode = normalizedErr.statusCode || 500;
  const errorCode = normalizedErr.errorCode || 'INTERNAL_SERVER_ERROR';
  const isOperational = normalizedErr.isOperational || false;

  logger.error(normalizedErr.message || 'Unhandled Server Exception', {\n    errorCode,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id || 'anonymous',
    stack: isOperational ? undefined : err.stack
  });

  const responsePayload = {
    success: false,
    error: {
      code: errorCode,
      message: isOperational ? normalizedErr.message : 'An unexpected error occurred. Please try again later.'
    }
  };

  if (normalizedErr.details) {
    responsePayload.error.details = normalizedErr.details;
  }

  if (env.NODE_ENV === 'development' && !isOperational) {
    responsePayload.error.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
}

module.exports = errorHandler;
