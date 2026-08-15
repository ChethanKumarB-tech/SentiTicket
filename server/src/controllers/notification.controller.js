const notificationService = require('../services/notification.service');

async function listNotifications(req, res, next) {
  try {
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await notificationService.listUserNotifications(req.user._id, req.user.organizationId, {
      isRead,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id, req.user.organizationId);
    return res.status(200).json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user._id, req.user.organizationId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listNotifications,
  markAsRead,
  markAllAsRead
};
