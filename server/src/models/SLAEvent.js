const mongoose = require('mongoose');

const slaEventSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: {
        values: [
          'SLA_STARTED',
          'SLA_PAUSED',
          'SLA_RESUMED',
          'SLA_AT_RISK',
          'SLA_CRITICAL',
          'SLA_BREACHED',
          'SLA_ESCALATED',
          'SLA_MET'
        ],
        message: 'Invalid SLA event type'
      },
      required: true,
      index: true
    },
    previousState: {
      type: String,
      default: null
    },
    newState: {
      type: String,
      required: true
    },
    deadlineSnapshot: {
      type: Date,
      required: true
    },
    timeRemainingMinutes: {
      type: Number,
      required: true
    },
    triggerSource: {
      type: String,
      enum: ['SYSTEM_DAEMON', 'USER_ACTION', 'SCHEDULED_JOB'],
      default: 'SYSTEM_DAEMON'
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

slaEventSchema.index({ ticketId: 1, createdAt: 1 });
slaEventSchema.index({ organizationId: 1, eventType: 1, createdAt: 1 });

const SLAEvent = mongoose.model('SLAEvent', slaEventSchema);

module.exports = SLAEvent;
