const crypto = require('crypto');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const SLAEvent = require('../models/SLAEvent');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const slaService = require('./sla.service');

function generateTicketId() {
  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
  const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TICK-${yearMonth}-${randomHex}`;
}

async function createTicket(organizationId, customerId, { title, description, category, priority = 'MEDIUM', tags = [] }, actor, ipAddress) {
  const ticketId = generateTicketId();

  const slaTargets = await slaService.resolveSlaTargets(organizationId, priority);

  const ticket = await Ticket.create({
    ticketId,
    organizationId,
    customerId,
    title,
    description,
    category,
    priority,
    status: 'NEW',
    slaPolicyId: slaTargets.slaPolicyId,
    slaTargetMinutes: slaTargets.slaTargetMinutes,
    slaResolutionTargetMinutes: slaTargets.slaResolutionTargetMinutes,
    slaResponseDeadline: slaTargets.slaResponseDeadline,
    slaResolutionDeadline: slaTargets.slaResolutionDeadline,
    slaState: 'SAFE',
    tags
  });

  await SLAEvent.create({
    organizationId,
    ticketId: ticket._id,
    eventType: 'SLA_STARTED',
    previousState: 'NONE',
    newState: 'SAFE',
    deadlineSnapshot: ticket.slaResolutionDeadline,
    timeRemainingMinutes: slaTargets.slaResolutionTargetMinutes,
    triggerSource: 'USER_ACTION',
    actorId: actor._id
  });

  await AuditLog.create({
    organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_CREATED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { ticketId: ticket.ticketId, priority, category }
  });

  return ticket;
}

async function listTickets(organizationId, actor, query) {
  const {
    page = 1,
    limit = 20,
    status,
    priority,
    category,
    slaState,
    assignedAgentId,
    isAssigned,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  const filter = { organizationId, deletedAt: null };

  if (actor.role === 'CUSTOMER') {
    filter.customerId = actor._id;
  } else if (actor.role === 'AGENT') {
    if (query.view === 'my_tickets') {
      filter.assignedAgentId = actor._id;
    } else if (query.view === 'queue') {
      filter.assignedAgentId = null;
    }
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (slaState) filter.slaState = slaState;
  if (assignedAgentId) filter.assignedAgentId = assignedAgentId;
  if (isAssigned === true) filter.assignedAgentId = { $ne: null };
  if (isAssigned === false) filter.assignedAgentId = null;

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
    filter.$or = [
      { ticketId: { $regex: escapedSearch, $options: 'i' } },
      { title: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate('customerId', 'firstName lastName email')
      .populate('assignedAgentId', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Ticket.countDocuments(filter)
  ]);

  return {
    tickets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getTicketDetails(ticketId, organizationId) {
  const ticket = await Ticket.findOne({
    $or: [{ _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null }, { ticketId: ticketId.toUpperCase() }],
    organizationId,
    deletedAt: null
  })
    .populate('customerId', 'firstName lastName email')
    .populate('assignedAgentId', 'firstName lastName email')
    .populate('slaPolicyId', 'name priorityRules businessHoursOnly');

  if (!ticket) {
    throw AppError.notFound('Ticket not found');
  }

  return ticket;
}

async function updateTicket(ticket, updates, actor, ipAddress) {
  if (updates.title) ticket.title = updates.title;
  if (updates.description) ticket.description = updates.description;
  if (updates.tags) ticket.tags = updates.tags;

  await ticket.save();

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_UPDATED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress
  });

  return ticket;
}

async function updateTicketStatus(ticket, newStatus, reason, actor, ipAddress) {
  const previousStatus = ticket.status;

  const allowedTransitions = {
    NEW: ['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED'],
    OPEN: ['IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'],
    IN_PROGRESS: ['PENDING', 'RESOLVED', 'CLOSED'],
    PENDING: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    RESOLVED: ['IN_PROGRESS', 'CLOSED'],
    CLOSED: ['IN_PROGRESS']
  };

  if (!allowedTransitions[previousStatus]?.includes(newStatus)) {
    throw AppError.badRequest(`Cannot transition status from ${previousStatus} to ${newStatus}`, 'INVALID_STATUS_TRANSITION');
  }

  ticket.status = newStatus;
  const now = new Date();

  if (newStatus === 'IN_PROGRESS' && !ticket.firstRespondedAt) {
    ticket.firstRespondedAt = now;
  }
  if (newStatus === 'RESOLVED') {
    ticket.resolvedAt = now;
  }
  if (newStatus === 'CLOSED') {
    ticket.closedAt = now;
  }

  if (newStatus === 'PENDING') {
    ticket.lastPausedAt = now;
    ticket.slaState = 'PAUSED';
  } else if (previousStatus === 'PENDING' && newStatus !== 'PENDING') {
    if (ticket.lastPausedAt) {
      const pausedMinutes = Math.floor((now - ticket.lastPausedAt) / 60000);
      ticket.pausedDurationMinutes += pausedMinutes;
      ticket.slaResolutionDeadline = new Date(ticket.slaResolutionDeadline.getTime() + pausedMinutes * 60000);
      ticket.lastPausedAt = null;
    }
    ticket.slaState = slaService.evaluateSlaState(ticket, now);
  }

  await ticket.save();

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_STATUS_CHANGED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { previousStatus, newStatus, reason }
  });

  return ticket;
}

async function updateTicketPriority(ticket, newPriority, reason, actor, ipAddress) {
  const previousPriority = ticket.priority;
  if (previousPriority === newPriority) {
    return ticket;
  }

  ticket.priority = newPriority;

  const slaTargets = await slaService.resolveSlaTargets(ticket.organizationId, newPriority);
  ticket.slaTargetMinutes = slaTargets.slaTargetMinutes;
  ticket.slaResolutionTargetMinutes = slaTargets.slaResolutionTargetMinutes;
  ticket.slaResponseDeadline = slaTargets.slaResponseDeadline;
  ticket.slaResolutionDeadline = slaTargets.slaResolutionDeadline;
  ticket.slaState = slaService.evaluateSlaState(ticket);

  await ticket.save();

  await SLAEvent.create({
    organizationId: ticket.organizationId,
    ticketId: ticket._id,
    eventType: 'SLA_RECALCULATED',
    previousState: previousPriority,
    newState: newPriority,
    deadlineSnapshot: ticket.slaResolutionDeadline,
    timeRemainingMinutes: Math.max(0, Math.floor((ticket.slaResolutionDeadline - new Date()) / 60000)),
    triggerSource: 'USER_ACTION',
    actorId: actor._id,
    metadata: { reason }
  });

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_PRIORITY_CHANGED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { previousPriority, newPriority, reason }
  });

  return ticket;
}

async function assignTicket(ticket, agentId, actor, ipAddress) {
  const agent = await User.findOne({
    _id: agentId,
    organizationId: ticket.organizationId,
    role: { $in: ['AGENT', 'MANAGER', 'ADMIN'] },
    status: 'ACTIVE'
  });

  if (!agent) {
    throw AppError.badRequest('Assigned agent was not found or is inactive', 'INVALID_ASSIGNEE');
  }

  ticket.assignedAgentId = agent._id;
  if (ticket.status === 'NEW') {
    ticket.status = 'OPEN';
  }
  await ticket.save();

  await Notification.create({
    organizationId: ticket.organizationId,
    recipientId: agent._id,
    type: 'TICKET_ASSIGNED',
    title: `Assigned: Ticket #${ticket.ticketId}`,
    message: `You have been assigned to Ticket #${ticket.ticketId}: "${ticket.title}"`,
    resourceType: 'TICKET',
    resourceId: ticket._id
  });

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_ASSIGNED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { assignedTo: agent._id, agentName: `${agent.firstName} ${agent.lastName}` }
  });

  return ticket;
}

async function claimTicket(ticket, actor, ipAddress) {
  if (ticket.assignedAgentId) {
    throw AppError.badRequest('Ticket is already assigned', 'ALREADY_ASSIGNED');
  }

  ticket.assignedAgentId = actor._id;
  if (ticket.status === 'NEW') {
    ticket.status = 'OPEN';
  }
  await ticket.save();

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_CLAIMED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { claimedBy: actor._id, agentName: `${actor.firstName} ${actor.lastName}` }
  });

  return ticket;
}

async function autoAssignTicket(ticket, actor, ipAddress) {
  const agents = await User.find({
    organizationId: ticket.organizationId,
    role: { $in: ['AGENT', 'MANAGER'] },
    status: 'ACTIVE'
  });

  if (agents.length === 0) {
    throw AppError.badRequest('No active agents available for assignment in this organization');
  }

  const agentWorkloads = await Promise.all(
    agents.map(async (agent) => {
      const openCount = await Ticket.countDocuments({
        organizationId: ticket.organizationId,
        assignedAgentId: agent._id,
        status: { $in: ['NEW', 'OPEN', 'IN_PROGRESS'] },
        deletedAt: null
      });
      return { agent, openCount };
    })
  );

  agentWorkloads.sort((a, b) => a.openCount - b.openCount);
  const bestAgent = agentWorkloads[0].agent;

  return assignTicket(ticket, bestAgent._id, actor, ipAddress);
}

async function escalateTicket(ticket, { reason, targetTier = 1 }, actor, ipAddress) {
  ticket.isEscalated = true;
  ticket.escalationTier = targetTier;
  if (ticket.priority === 'LOW') ticket.priority = 'MEDIUM';
  else if (ticket.priority === 'MEDIUM') ticket.priority = 'HIGH';
  else if (ticket.priority === 'HIGH') ticket.priority = 'CRITICAL';

  await ticket.save();

  await SLAEvent.create({
    organizationId: ticket.organizationId,
    ticketId: ticket._id,
    eventType: 'SLA_ESCALATED',
    previousState: `Tier ${ticket.escalationTier - 1}`,
    newState: `Tier ${ticket.escalationTier}`,
    deadlineSnapshot: ticket.slaResolutionDeadline,
    timeRemainingMinutes: Math.max(0, Math.floor((ticket.slaResolutionDeadline - new Date()) / 60000)),
    triggerSource: 'USER_ACTION',
    actorId: actor._id,
    metadata: { reason }
  });

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_ESCALATED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { reason, escalationTier: ticket.escalationTier }
  });

  return ticket;
}

async function softDeleteTicket(ticket, actor, ipAddress) {
  ticket.deletedAt = new Date();
  await ticket.save();

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: actor._id,
    actorRole: actor.role,
    action: 'TICKET_DELETED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress
  });

  return { success: true, message: 'Ticket soft-deleted successfully' };
}

module.exports = {
  createTicket,
  listTickets,
  getTicketDetails,
  updateTicket,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  claimTicket,
  autoAssignTicket,
  escalateTicket,
  softDeleteTicket
};
