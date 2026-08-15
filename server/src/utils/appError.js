class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Invalid request parameters', errorCode = 'BAD_REQUEST', details = null) {
    return new AppError(message, 400, errorCode, details);
  }

  static unauthorized(message = 'Authentication required', errorCode = 'UNAUTHORIZED') {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message = 'You do not have permission to perform this action', errorCode = 'FORBIDDEN') {
    return new AppError(message, 403, errorCode);
  }

  static notFound(message = 'Requested resource was not found', errorCode = 'NOT_FOUND') {
    return new AppError(message, 404, errorCode);
  }

  static conflict(message = 'Resource conflict or duplicate entry', errorCode = 'CONFLICT') {
    return new AppError(message, 409, errorCode);
  }

  static unprocessable(message = 'Validation failed', errorCode = 'VALIDATION_ERROR', details = null) {
    return new AppError(message, 422, errorCode, details);
  }

  static tooManyRequests(message = 'Rate limit exceeded. Please try again later.', errorCode = 'RATE_LIMIT_EXCEEDED') {
    return new AppError(message, 429, errorCode);
  }

  static internal(message = 'An unexpected internal error occurred', errorCode = 'INTERNAL_SERVER_ERROR') {
    return new AppError(message, 500, errorCode);
  }
}

module.exports = AppError;
