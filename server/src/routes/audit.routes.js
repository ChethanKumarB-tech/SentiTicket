const express = require('express');
const { listAuditLogs } = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');

const router = express.Router();

router.use(authenticate, enforceTenantScope, requireRoles('MANAGER', 'ADMIN'));

router.get('/', listAuditLogs);

module.exports = router;
