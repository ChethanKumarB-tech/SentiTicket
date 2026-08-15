const AppError = require('../utils/appError');

function enforceTenantScope(req, res, next) {
  if (!req.user || !req.user.organizationId) {
    return next(AppError.unauthorized('Authenticated organization context required', 'TENANT_CONTEXT_MISSING'));
  }

  if (req.body && typeof req.body === 'object') {
    req.body.organizationId = req.user.organizationId;
  }
  if (req.query && typeof req.query === 'object') {
    req.query.organizationId = req.user.organizationId;
  }

  return next();
}

module.exports = {
  enforceTenantScope
};
