const Notification = require('../models/Notification');
const AppError = require('../utils/appError');

async function listUserNotifications(userId, organizationId, { isRead, page = 1, limit = 20 }) {
  const filter = { recipientId: userId, organizationId };
  if (typeof isRead === 'boolean') {
    filter.isRead = isRead;
  }

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipientId: userId, organizationId, isRead: false })
  ]);

  return {\n    notifications,
    unreadCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function markAsRead(notificationId, userId, organizationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId, organizationId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw AppError.notFound('Notification not found');
  }

  return notification;
}

async function markAllAsRead(userId, organizationId) {
  await Notification.updateMany(
    { recipientId: userId, organizationId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return { success: true, message: 'All notifications marked as read' };
}

module.exports = {
  listUserNotifications,
  markAsRead,
  markAllAsRead
};
