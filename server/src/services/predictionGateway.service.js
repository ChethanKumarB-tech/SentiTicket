const Ticket = require('../models/Ticket');
const Prediction = require('../models/Prediction');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const env = require('../config/environment');

const CATEGORY_HISTORICAL_HOURS = {
  TECHNICAL: 4.5,
  BILLING: 2.0,
  FEATURE_REQUEST: 12.0,
  SECURITY: 3.0,
  GENERAL: 2.5
};

async function getOrComputePrediction(ticket, actor, ipAddress) {
  const now = new Date();
  const ticketAgeHours = Math.max(0, (now - new Date(ticket.createdAt)) / 3600000);
  const slaRemainingHours = (new Date(ticket.slaResolutionDeadline) - now) / 3600000;

  let agentOpenTickets = 0;
  if (ticket.assignedAgentId) {
    agentOpenTickets = await Ticket.countDocuments({
      organizationId: ticket.organizationId,
      assignedAgentId: ticket.assignedAgentId,
      status: { $in: ['NEW', 'OPEN', 'IN_PROGRESS'] },
      deletedAt: null
    });
  }

  const payload = {
    ticketId: ticket.ticketId,
    priority: ticket.priority,
    category: ticket.category,
    ticketAgeHours: Number(ticketAgeHours.toFixed(2)),
    slaRemainingHours: Number(slaRemainingHours.toFixed(2)),
    agentOpenTickets,
    historicalResolutionHours: CATEGORY_HISTORICAL_HOURS[ticket.category] || 4.0
  };

  let predictionData;

  try {
    const response = await fetch(`${env.ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': env.ML_SERVICE_SECRET
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`ML Service responded with HTTP ${response.status}`);
    }

    predictionData = await response.json();
  } catch (error) {
    logger.warn('[ML Gateway] Python prediction microservice unavailable or timed out, using fallback heuristics', { error: error.message });
    const isOverdue = slaRemainingHours <= 0;
    const prob = isOverdue ? 0.95 : Math.min(0.9, Math.max(0.1, (payload.historicalResolutionHours - slaRemainingHours) * 0.2 + 0.3));
    predictionData = {
      ticketId: ticket.ticketId,
      breachProbability: Number(prob.toFixed(2)),
      riskLevel: prob >= 0.8 ? 'CRITICAL' : prob >= 0.5 ? 'HIGH' : prob >= 0.3 ? 'MEDIUM' : 'LOW',
      predictedResolutionHours: Number(payload.historicalResolutionHours.toFixed(1)),
      riskFactors: ['Computed via fallback SLA heuristic'],
      modelVersion: 'heuristic-fallback-v1.0'
    };
  }

  if (
    typeof predictionData.breachProbability !== 'number' ||
    predictionData.breachProbability < 0 ||
    predictionData.breachProbability > 1
  ) {
    throw AppError.internal('Received invalid probability from ML microservice');
  }

  const predictionDoc = await Prediction.create({
    organizationId: ticket.organizationId,
    ticketId: ticket._id,
    modelVersion: predictionData.modelVersion,
    featureSnapshot: payload,
    breachProbability: predictionData.breachProbability,
    riskLevel: predictionData.riskLevel,
    predictedResolutionHours: predictionData.predictedResolutionHours,
    riskFactors: predictionData.riskFactors || []
  });

  ticket.latestPrediction = {
    breachProbability: predictionData.breachProbability,
    riskLevel: predictionData.riskLevel,
    predictedResolutionHours: predictionData.predictedResolutionHours,
    riskFactors: predictionData.riskFactors || [],
    modelVersion: predictionData.modelVersion,
    calculatedAt: new Date()
  };
  await ticket.save();

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'PREDICTION_COMPUTED',
    resourceType: 'PREDICTION',
    resourceId: predictionDoc._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { ticketId: ticket.ticketId, riskLevel: predictionData.riskLevel, probability: predictionData.breachProbability }
  });

  return predictionDoc;
}

async function listAtRiskPredictions(organizationId, actor) {
  const filter = {
    organizationId,
    status: { $in: ['NEW', 'OPEN', 'IN_PROGRESS'] },
    'latestPrediction.riskLevel': { $in: ['HIGH', 'CRITICAL'] },
    deletedAt: null
  };

  if (actor && actor.role === 'AGENT') {
    filter.assignedAgentId = actor._id;
  }

  const atRiskTickets = await Ticket.find(filter)
    .populate('assignedAgentId', 'firstName lastName email')
    .sort({ 'latestPrediction.breachProbability': -1 });

  return atRiskTickets;
}

module.exports = {
  getOrComputePrediction,
  listAtRiskPredictions
};
