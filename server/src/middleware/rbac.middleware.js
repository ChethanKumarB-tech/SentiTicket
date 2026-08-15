const AppError = require('../utils/appError');
const { hasPermission } = require('../config/permissions');

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
          'INSUFFICIENT_ROLE'
        )
      );
    }

    return next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required', 'UNAUTHORIZED'));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(
        AppError.forbidden(
          `Access denied. Missing required permission: '${permission}'`,
          'PERMISSION_DENIED'
        )
      );
    }

    return next();
  };
}

module.exports = {
  requireRoles,
  requirePermission
};
