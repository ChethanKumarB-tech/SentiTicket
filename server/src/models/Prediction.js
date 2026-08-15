const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
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
    modelVersion: {
      type: String,
      required: true,
      trim: true
    },
    featureSnapshot: {
      priority: { type: String, required: true },
      category: { type: String, required: true },
      ticketAgeHours: { type: Number, required: true },
      slaRemainingHours: { type: Number, required: true },
      agentOpenTickets: { type: Number, required: true },
      historicalResolutionHours: { type: Number, required: true }
    },
    breachProbability: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      index: true
    },
    predictedResolutionHours: {
      type: Number,
      required: true,
      min: 0
    },
    riskFactors: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

predictionSchema.index({ ticketId: 1, createdAt: -1 });
predictionSchema.index({ organizationId: 1, riskLevel: 1, createdAt: -1 });

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;
