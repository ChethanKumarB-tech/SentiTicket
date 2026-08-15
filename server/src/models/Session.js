const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true
    },
    familyId: {
      type: String,
      required: true,
      index: true
    },
    userAgent: {
      type: String,
      default: 'Unknown'
    },
    ipAddress: {
      type: String,
      default: 'Unknown'
    },
    deviceInfo: {
      os: { type: String, default: 'Unknown' },
      browser: { type: String, default: 'Unknown' },
      deviceType: { type: String, default: 'Desktop' }
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1, isRevoked: 1 });
sessionSchema.index({ familyId: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
