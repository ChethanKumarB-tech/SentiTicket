const predictionGateway = require('../services/predictionGateway.service');
const Ticket = require('../models/Ticket');
const AppError = require('../utils/appError');

async function getPredictionForTicket(req, res, next) {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findOne({
      $or: [{ _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null }, { ticketId: ticketId.toUpperCase() }],
      organizationId: req.user.organizationId,
      deletedAt: null
    });

    if (!ticket) {
      throw AppError.notFound('Ticket not found');
    }

    const prediction = await predictionGateway.getOrComputePrediction(ticket, req.user, req.ip);

    return res.status(200).json({
      success: true,
      data: { prediction }
    });
  } catch (error) {
    next(error);
  }
}

async function getAtRiskPredictions(req, res, next) {
  try {
    const atRiskTickets = await predictionGateway.listAtRiskPredictions(req.user.organizationId, req.user);
    return res.status(200).json({
      success: true,
      data: { atRiskTickets }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPredictionForTicket,
  getAtRiskPredictions
};
