const rateLimit = require('express-rate-limit');
const AppError = require('../utils/appError');

function createLimiter(windowMs, maxRequests, message, errorCode = 'RATE_LIMIT_EXCEEDED') {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(AppError.tooManyRequests(message, errorCode));
    }
  });
}

const globalLimiter = createLimiter(
  15 * 60 * 1000,
  300,
  'Too many requests from this IP. Please try again in 15 minutes.'
);

const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  'AUTH_RATE_LIMIT_EXCEEDED'
);

const moderateLimiter = createLimiter(
  15 * 60 * 1000,
  40,
  'Too many operations requested. Please wait a moment before trying again.',
  'OPERATION_RATE_LIMIT_EXCEEDED'
);

const strictMutationLimiter = createLimiter(
  15 * 60 * 1000,
  15,
  'Too many sensitive administrative actions requested. Please try again later.',
  'ADMIN_RATE_LIMIT_EXCEEDED'
);

module.exports = {
  globalLimiter,
  authLimiter,
  moderateLimiter,
  strictMutationLimiter
};
