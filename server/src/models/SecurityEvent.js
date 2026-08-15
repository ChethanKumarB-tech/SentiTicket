const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    eventType: {
      type: String,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'ACCOUNT_LOCKED',
        'PASSWORD_RESET_REQ',
        'PASSWORD_RESET_DONE',
        'MFA_CHALLENGE_FAILED',
        'TOKEN_REUSE_DETECTED',
        'BOLA_ATTEMPT_BLOCKED',
        'RATE_LIMIT_EXCEEDED',
        'MALICIOUS_FILE_BLOCKED'
      ],
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
      index: true
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    },
    requestPath: {
      type: String,
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

securityEventSchema.index({ severity: 1, createdAt: -1 });
securityEventSchema.index({ ipAddress: 1, eventType: 1, createdAt: -1 });
securityEventSchema.index({ organizationId: 1, eventType: 1 });

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);

module.exports = SecurityEvent;
