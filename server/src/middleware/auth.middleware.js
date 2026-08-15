const { verifyAccessToken } = require('../utils/token.utils');
const User = require('../models/User');
const Organization = require('../models/Organization');
const AppError = require('../utils/appError');

async function authenticate(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token is missing. Please log in.', 'AUTH_TOKEN_MISSING'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(AppError.unauthorized('Authentication token has expired. Please refresh your session.', 'TOKEN_EXPIRED'));
      }
      return next(AppError.unauthorized('Invalid authentication token', 'INVALID_TOKEN'));
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      return next(AppError.unauthorized('The account associated with this token no longer exists', 'USER_NOT_FOUND'));
    }

    if (user.status === 'SUSPENDED') {
      return next(AppError.forbidden('Your account has been suspended', 'ACCOUNT_SUSPENDED'));
    }
    if (user.status === 'LOCKED' && user.lockoutUntil && user.lockoutUntil > new Date()) {
      return next(AppError.forbidden('Your account is temporarily locked', 'ACCOUNT_LOCKED'));
    }

    if (decoded.tokenVersion && user.tokenVersion !== decoded.tokenVersion) {
      return next(AppError.unauthorized('Session has been revoked due to a password or security update', 'TOKEN_REVOKED'));
    }

    const organization = await Organization.findById(user.organizationId);
    if (!organization || organization.status !== 'ACTIVE') {
      return next(AppError.forbidden('Organization account is inactive or suspended', 'ORGANIZATION_INACTIVE'));
    }

    req.user = user;
    req.organization = organization;
    req.organizationId = user.organizationId;

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authenticate
};
