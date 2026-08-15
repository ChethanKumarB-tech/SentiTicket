const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: [200, 'Ticket title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      maxlength: [10000, 'Ticket description cannot exceed 10,000 characters']
    },
    category: {
      type: String,
      enum: {
        values: ['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'SECURITY', 'GENERAL'],
        message: 'Invalid category specified'
      },
      required: [true, 'Ticket category is required'],
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        message: 'Priority must be LOW, MEDIUM, HIGH, or CRITICAL'
      },
      default: 'MEDIUM',
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'],
        message: 'Invalid status specified'
      },
      default: 'NEW',
      index: true
    },
    slaPolicyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SLAPolicy',
      required: [true, 'SLA policy reference is required']
    },
    slaTargetMinutes: {
      type: Number,
      required: true
    },
    slaResolutionTargetMinutes: {
      type: Number,
      required: true
    },
    slaResponseDeadline: {
      type: Date,
      required: true,
      index: true
    },
    slaResolutionDeadline: {
      type: Date,
      required: true,
      index: true
    },
    slaState: {
      type: String,
      enum: {
        values: ['SAFE', 'AT_RISK', 'CRITICAL', 'BREACHED', 'PAUSED'],
        message: 'SLA State must be SAFE, AT_RISK, CRITICAL, BREACHED, or PAUSED'
      },
      default: 'SAFE',
      index: true
    },
    firstRespondedAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    closedAt: {
      type: Date,
      default: null
    },
    breachedAt: {
      type: Date,
      default: null
    },
    isEscalated: {
      type: Boolean,
      default: false,
      index: true
    },
    escalationTier: {
      type: Number,
      default: 0
    },
    pausedDurationMinutes: {
      type: Number,
      default: 0
    },
    lastPausedAt: {
      type: Date,
      default: null
    },
    latestPrediction: {
      breachProbability: { type: Number, min: 0, max: 1 },
      riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      predictedResolutionHours: { type: Number, min: 0 },
      riskFactors: [String],
      modelVersion: String,
      calculatedAt: Date
    },
    tags: {
      type: [String],
      default: []
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ticketSchema.index({ organizationId: 1, ticketId: 1 }, { unique: true });
ticketSchema.index({ organizationId: 1, customerId: 1, status: 1 });
ticketSchema.index({ organizationId: 1, assignedAgentId: 1, status: 1 });
ticketSchema.index({ organizationId: 1, status: 1, priority: 1, slaResolutionDeadline: 1 });
ticketSchema.index({ slaState: 1, status: 1, slaResolutionDeadline: 1 });
ticketSchema.index({ organizationId: 1, deletedAt: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
