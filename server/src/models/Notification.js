const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: {
        values: [
          'TICKET_ASSIGNED',
          'TICKET_UPDATED',
          'COMMENT_ADDED',
          'SLA_WARNING',
          'SLA_CRITICAL',
          'SLA_BREACHED',
          'TICKET_ESCALATED',
          'PREDICTION_RISK'
        ],
        message: 'Invalid notification type'
      },
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters']
    },
    resourceType: {
      type: String,
      enum: ['TICKET', 'SLA', 'SYSTEM'],
      default: 'TICKET'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    idempotencyKey: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
