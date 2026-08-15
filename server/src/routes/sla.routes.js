const express = require('express');
const slaController = require('../controllers/sla.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');
const { strictMutationLimiter } = require('../middleware/rateLimiter.middleware');
const { createSlaPolicySchema, updateSlaPolicySchema } = require('../validators/sla.validator');

const router = express.Router();

router.use(authenticate, enforceTenantScope);

router.get('/monitor', requireRoles('AGENT', 'MANAGER', 'ADMIN'), slaController.getSlaMonitor);
router.get('/breaches', requireRoles('MANAGER', 'ADMIN'), slaController.getHistoricBreaches);

router.get('/policies', requireRoles('AGENT', 'MANAGER', 'ADMIN'), slaController.listPolicies);
router.post('/policies', requireRoles('ADMIN'), strictMutationLimiter, validate(createSlaPolicySchema), slaController.createPolicy);
router.patch('/policies/:id', requireRoles('ADMIN', 'MANAGER'), strictMutationLimiter, validate(updateSlaPolicySchema), slaController.updatePolicy);

module.exports = router;
