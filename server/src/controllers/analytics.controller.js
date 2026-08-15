const Ticket = require('../models/Ticket');
const User = require('../models/User');

async function getAnalyticsOverview(req, res, next) {
  try {
    const orgId = req.user.organizationId;

    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      breachedTickets,
      criticalTickets,
      priorityDistribution,
      categoryDistribution
    ] = await Promise.all([
      Ticket.countDocuments({ organizationId: orgId, deletedAt: null }),
      Ticket.countDocuments({ organizationId: orgId, status: { $in: ['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING'] }, deletedAt: null }),
      Ticket.countDocuments({ organizationId: orgId, status: { $in: ['RESOLVED', 'CLOSED'] }, deletedAt: null }),
      Ticket.countDocuments({ organizationId: orgId, slaState: 'BREACHED', deletedAt: null }),
      Ticket.countDocuments({ organizationId: orgId, priority: 'CRITICAL', status: { $ne: 'CLOSED' }, deletedAt: null }),
      Ticket.aggregate([
        { $match: { organizationId: orgId, deletedAt: null } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $match: { organizationId: orgId, deletedAt: null } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const resolvedWithoutBreach = await Ticket.countDocuments({
      organizationId: orgId,
      status: { $in: ['RESOLVED', 'CLOSED'] },
      breachedAt: null,
      deletedAt: null
    });

    const slaComplianceRate = resolvedTickets > 0 ? Number(((resolvedWithoutBreach / resolvedTickets) * 100).toFixed(1)) : 100.0;

    const resolvedTicketDocs = await Ticket.find({
      organizationId: orgId,
      resolvedAt: { $ne: null },
      deletedAt: null
    }).select('createdAt resolvedAt');

    let totalResolutionHours = 0;
    resolvedTicketDocs.forEach((t) => {
      totalResolutionHours += (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000;
    });

    const averageResolutionHours = resolvedTicketDocs.length > 0 ? Number((totalResolutionHours / resolvedTicketDocs.length).toFixed(1)) : 0.0;

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalTickets,
          openTickets,
          resolvedTickets,
          breachedTickets,
          criticalTickets,
          slaComplianceRate,
          averageResolutionHours
        },
        priorityDistribution: Object.fromEntries(priorityDistribution.map((p) => [p._id, p.count])),
        categoryDistribution: Object.fromEntries(categoryDistribution.map((c) => [c._id, c.count]))
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getAgentWorkload(req, res, next) {
  try {
    const orgId = req.user.organizationId;
    const agents = await User.find({
      organizationId: orgId,
      role: { $in: ['AGENT', 'MANAGER'] },
      status: 'ACTIVE'
    }).select('firstName lastName email role');

    const workload = await Promise.all(
      agents.map(async (agent) => {
        const [openCount, criticalCount, atRiskCount] = await Promise.all([
          Ticket.countDocuments({ organizationId: orgId, assignedAgentId: agent._id, status: { $in: ['NEW', 'OPEN', 'IN_PROGRESS'] }, deletedAt: null }),
          Ticket.countDocuments({ organizationId: orgId, assignedAgentId: agent._id, slaState: 'CRITICAL', deletedAt: null }),
          Ticket.countDocuments({ organizationId: orgId, assignedAgentId: agent._id, slaState: 'AT_RISK', deletedAt: null })
        ]);

        const maxCapacity = 10;
        const capacityPercentage = Math.min(100, Math.round((openCount / maxCapacity) * 100));

        return {
          agent: {
            _id: agent._id,
            name: `${agent.firstName} ${agent.lastName}`,
            email: agent.email,
            role: agent.role
          },
          openTickets: openCount,
          criticalTickets: criticalCount,
          atRiskTickets: atRiskCount,
          capacityPercentage,
          status: capacityPercentage >= 90 ? 'OVERLOADED' : capacityPercentage >= 60 ? 'OPTIMAL' : 'AVAILABLE'
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: { workload }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnalyticsOverview,
  getAgentWorkload
};
