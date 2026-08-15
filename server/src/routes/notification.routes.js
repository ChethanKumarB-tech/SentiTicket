const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');

const router = express.Router();

router.use(authenticate, enforceTenantScope);

router.get('/', notificationController.listNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
