const express = require('express');
const predictionController = require('../controllers/prediction.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');
const { moderateLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate, enforceTenantScope);

router.get('/ticket/:id', requireRoles('AGENT', 'MANAGER', 'ADMIN'), moderateLimiter, predictionController.getPredictionForTicket);
router.get('/at-risk', requireRoles('AGENT', 'MANAGER', 'ADMIN'), predictionController.getAtRiskPredictions);

module.exports = router;
