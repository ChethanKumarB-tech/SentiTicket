const ticketService = require('../services/ticket.service');
const commentService = require('../services/comment.service');

async function createTicket(req, res, next) {
  try {
    const ticket = await ticketService.createTicket(
      req.user.organizationId,
      req.user._id,
      req.body,
      req.user,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function listTickets(req, res, next) {
  try {
    const result = await ticketService.listTickets(req.user.organizationId, req.user, req.query);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

async function getTicket(req, res, next) {
  try {
    const ticket = await ticketService.getTicketDetails(req.ticket._id.toString(), req.user.organizationId);
    return res.status(200).json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function updateTicket(req, res, next) {
  try {
    const ticket = await ticketService.updateTicket(req.ticket, req.body, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const ticket = await ticketService.updateTicketStatus(
      req.ticket,
      req.body.status,
      req.body.reason,
      req.user,
      req.ip
    );
    return res.status(200).json({
      success: true,
      message: `Ticket status updated to ${req.body.status}`,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function updatePriority(req, res, next) {
  try {
    const ticket = await ticketService.updateTicketPriority(
      req.ticket,
      req.body.priority,
      req.body.reason,
      req.user,
      req.ip
    );
    return res.status(200).json({
      success: true,
      message: `Ticket priority updated to ${req.body.priority} and SLA recalculated`,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function assignTicket(req, res, next) {
  try {
    const ticket = await ticketService.assignTicket(req.ticket, req.body.assignedAgentId, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function claimTicket(req, res, next) {
  try {
    const ticket = await ticketService.claimTicket(req.ticket, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: 'Ticket claimed successfully',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function autoAssign(req, res, next) {
  try {
    const ticket = await ticketService.autoAssignTicket(req.ticket, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: 'Ticket automatically assigned based on workload balancing',
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function escalate(req, res, next) {
  try {
    const ticket = await ticketService.escalateTicket(req.ticket, req.body, req.user, req.ip);
    return res.status(200).json({
      success: true,
      message: `Ticket escalated to Tier ${ticket.escalationTier}`,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTicket(req, res, next) {
  try {
    const result = await ticketService.softDeleteTicket(req.ticket, req.user, req.ip);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function addComment(req, res, next) {
  try {
    const comment = await commentService.addComment(req.ticket, req.user, req.body, req.ip);
    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error) {
    next(error);
  }
}

async function listComments(req, res, next) {
  try {
    const comments = await commentService.listTicketComments(req.ticket, req.user);
    return res.status(200).json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  updateStatus,
  updatePriority,
  assignTicket,
  claimTicket,
  autoAssign,
  escalate,
  deleteTicket,
  addComment,
  listComments
};
