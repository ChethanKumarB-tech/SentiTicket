const SLAPolicy = require('../models/SLAPolicy');
const Ticket = require('../models/Ticket');
const SLAEvent = require('../models/SLAEvent');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');

async function listPolicies(req, res, next) {
  try {
    const policies = await SLAPolicy.find({ organizationId: req.user.organizationId }).sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: { policies }
    });
  } catch (error) {
    next(error);
  }
}

async function createPolicy(req, res, next) {
  try {
    if (req.body.isDefault) {
      await SLAPolicy.updateMany({ organizationId: req.user.organizationId }, { isDefault: false });
    }

    const policy = await SLAPolicy.create({
      ...req.body,
      organizationId: req.user.organizationId
    });

    await AuditLog.create({
      organizationId: req.user.organizationId,
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'SLA_POLICY_CREATED',
      resourceType: 'SLA_POLICY',
      resourceId: policy._id.toString(),
      result: 'SUCCESS',
      ipAddress: req.ip,
      details: { name: policy.name }
    });

    return res.status(201).json({
      success: true,
      message: 'SLA policy created successfully',
      data: { policy }
    });
  } catch (error) {
    next(error);
  }
}

async function updatePolicy(req, res, next) {
  try {
    const policy = await SLAPolicy.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
    if (!policy) {
      throw AppError.notFound('SLA Policy not found');
    }

    if (req.body.isDefault) {
      await SLAPolicy.updateMany({ organizationId: req.user.organizationId }, { isDefault: false });
    }

    Object.assign(policy, req.body);
    await policy.save();

    await AuditLog.create({
      organizationId: req.user.organizationId,
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'SLA_POLICY_UPDATED',
      resourceType: 'SLA_POLICY',
      resourceId: policy._id.toString(),
      result: 'SUCCESS',
      ipAddress: req.ip,
      details: { name: policy.name }
    });

    return res.status(200).json({
      success: true,
      message: 'SLA policy updated successfully',
      data: { policy }
    });
  } catch (error) {
    next(error);
  }
}

async function getSlaMonitor(req, res, next) {
  try {
    const activeTickets = await Ticket.find({
      organizationId: req.user.organizationId,
      status: { $in: ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING'] },
      deletedAt: null
    })
      .populate('assignedAgentId', 'firstName lastName email')
      .populate('customerId', 'firstName lastName email')
      .sort({ slaResolutionDeadline: 1 });

    const grouped = {
      CRITICAL: [],
      AT_RISK: [],
      BREACHED: [],
      SAFE: [],
      PAUSED: []
    };

    activeTickets.forEach((ticket) => {
      if (grouped[ticket.slaState]) {
        grouped[ticket.slaState].push(ticket);
      }
    });

    const summary = {
      totalActive: activeTickets.length,
      criticalCount: grouped.CRITICAL.length,
      atRiskCount: grouped.AT_RISK.length,
      breachedCount: grouped.BREACHED.length,
      safeCount: grouped.SAFE.length,
      pausedCount: grouped.PAUSED.length
    };

    return res.status(200).json({
      success: true,
      data: {
        summary,
        tickets: grouped
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getHistoricBreaches(req, res, next) {
  try {
    const breaches = await SLAEvent.find({
      organizationId: req.user.organizationId,
      eventType: 'SLA_BREACHED'
    })
      .populate('ticketId', 'ticketId title priority customerId assignedAgentId')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: { breaches }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPolicies,
  createPolicy,
  updatePolicy,
  getSlaMonitor,
  getHistoricBreaches
};
