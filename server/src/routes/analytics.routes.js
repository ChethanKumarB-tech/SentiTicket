const express = require('express');
const { getAnalyticsOverview, getAgentWorkload } = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');

const router = express.Router();

router.use(authenticate, enforceTenantScope, requireRoles('MANAGER', 'ADMIN'));

router.get('/overview', getAnalyticsOverview);
router.get('/workload', getAgentWorkload);

module.exports = router;
