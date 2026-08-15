const Ticket = require('../models/Ticket');
const AppError = require('../utils/appError');

async function authorizeTicketAccess(req, res, next) {
  try {
    const ticketId = req.params.id || req.params.ticketId;
    if (!ticketId) {
      return next(AppError.badRequest('Ticket ID parameter is required', 'MISSING_PARAM'));
    }

    const ticket = await Ticket.findOne({
      $or: [{ _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null }, { ticketId: ticketId.toUpperCase() }],
      organizationId: req.user.organizationId,
      deletedAt: null
    });

    if (!ticket) {
      return next(AppError.notFound('Ticket was not found', 'TICKET_NOT_FOUND'));
    }

    if (req.user.role === 'CUSTOMER') {
      if (ticket.customerId.toString() !== req.user._id.toString()) {
        return next(AppError.forbidden('You do not have permission to view or modify this ticket', 'FORBIDDEN_TICKET_ACCESS'));
      }
    } else if (req.user.role === 'AGENT') {
    }

    req.ticket = ticket;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  authorizeTicketAccess
};
