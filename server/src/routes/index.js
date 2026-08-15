const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const ticketRoutes = require('./ticket.routes');
const slaRoutes = require('./sla.routes');
const predictionRoutes = require('./prediction.routes');
const notificationRoutes = require('./notification.routes');
const attachmentRoutes = require('./attachment.routes');
const auditRoutes = require('./audit.routes');
const securityRoutes = require('./security.routes');
const analyticsRoutes = require('./analytics.routes');
const sessionRoutes = require('./session.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
router.use('/sla', slaRoutes);
router.use('/predictions', predictionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/security', securityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/sessions', sessionRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'HEALTHY',
    service: 'SentiTicket Node.js API Gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;
