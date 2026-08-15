const express = require('express');
const { listSecurityEvents } = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');

const router = express.Router();

router.use(authenticate, enforceTenantScope, requireRoles('ADMIN'));

router.get('/events', listSecurityEvents);

module.exports = router;
