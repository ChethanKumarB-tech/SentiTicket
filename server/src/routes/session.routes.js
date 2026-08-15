const express = require('express');
const Session = require('../models/Session');
const { authenticate } = require('../middleware/auth.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');
const AppError = require('../utils/appError');

const router = express.Router();

router.use(authenticate, enforceTenantScope);

router.get('/', async (req, res, next) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    })
      .select('deviceInfo ipAddress userAgent createdAt lastActivityAt')
      .sort({ lastActivityAt: -1 });

    return res.status(200).json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRevoked: true }
    );
    if (!session) {
      throw AppError.notFound('Session not found');
    }
    return res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    await Session.updateMany({ userId: req.user._id }, { isRevoked: true });
    return res.status(200).json({
      success: true,
      message: 'All other sessions have been revoked'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
