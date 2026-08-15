const SLAPolicy = require('../models/SLAPolicy');
const SLAEvent = require('../models/SLAEvent');
const Ticket = require('../models/Ticket');
const Organization = require('../models/Organization');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

function calculateDeadline(startDate, targetMinutes, businessHours = null, businessHoursOnly = false) {
  if (!businessHoursOnly || !businessHours) {
    return new Date(startDate.getTime() + targetMinutes * 60 * 1000);
  }

  const [startHour, startMin] = (businessHours.start || '09:00').split(':').map(Number);
  const [endHour, endMin] = (businessHours.end || '18:00').split(':').map(Number);
  const workDays = businessHours.workDays || [1, 2, 3, 4, 5];

  let current = new Date(startDate.getTime());
  let remainingMinutes = targetMinutes;

  while (remainingMinutes > 0) {
    const dayOfWeek = current.getUTCDay();
    const isWorkDay = workDays.includes(dayOfWeek);

    const workStart = new Date(current);
    workStart.setUTCHours(startHour, startMin, 0, 0);

    const workEnd = new Date(current);
    workEnd.setUTCHours(endHour, endMin, 0, 0);

    if (!isWorkDay || current >= workEnd) {
      current.setUTCDate(current.getUTCDate() + 1);
      current.setUTCHours(startHour, startMin, 0, 0);
      continue;
    }

    if (current < workStart) {
      current = new Date(workStart);
    }

    const availableMinutesToday = Math.floor((workEnd.getTime() - current.getTime()) / 60000);

    if (remainingMinutes <= availableMinutesToday) {
      current = new Date(current.getTime() + remainingMinutes * 60000);
      remainingMinutes = 0;
    } else {
      remainingMinutes -= availableMinutesToday;
      current.setUTCDate(current.getUTCDate() + 1);
      current.setUTCHours(startHour, startMin, 0, 0);
    }
  }

  return current;
}

async function resolveSlaTargets(organizationId, priority) {
  let policy = await SLAPolicy.findOne({ organizationId, isDefault: true, status: 'ACTIVE' });
  if (!policy) {
    policy = await SLAPolicy.findOne({ organizationId, status: 'ACTIVE' });
  }

  const org = await Organization.findById(organizationId);

  const fallbackRules = {
    CRITICAL: { responseTargetMinutes: 30, resolutionTargetMinutes: 120, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
    HIGH: { responseTargetMinutes: 60, resolutionTargetMinutes: 240, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
    MEDIUM: { responseTargetMinutes: 120, resolutionTargetMinutes: 480, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 },
    LOW: { responseTargetMinutes: 240, resolutionTargetMinutes: 1440, warningThresholdPercentage: 50, criticalThresholdPercentage: 80 }
  };

  const rule = policy?.priorityRules?.find((r) => r.priority === priority) || fallbackRules[priority] || fallbackRules.MEDIUM;
  const businessHoursOnly = policy ? policy.businessHoursOnly : true;
  const businessHours = org?.settings?.businessHours || { start: '09:00', end: '18:00', workDays: [1, 2, 3, 4, 5] };

  const now = new Date();
  const slaResponseDeadline = calculateDeadline(now, rule.responseTargetMinutes, businessHours, businessHoursOnly);
  const slaResolutionDeadline = calculateDeadline(now, rule.resolutionTargetMinutes, businessHours, businessHoursOnly);

  return {
    slaPolicyId: policy ? policy._id : org?.settings?.defaultSlaPolicyId,
    slaTargetMinutes: rule.responseTargetMinutes,
    slaResolutionTargetMinutes: rule.resolutionTargetMinutes,
    slaResponseDeadline,
    slaResolutionDeadline,
    warningThresholdPercentage: rule.warningThresholdPercentage || 50,
    criticalThresholdPercentage: rule.criticalThresholdPercentage || 80
  };
}

function evaluateSlaState(ticket, now = new Date()) {
  if (['RESOLVED', 'CLOSED'].includes(ticket.status)) {
    return ticket.slaState;
  }
  if (ticket.status === 'PENDING') {
    return 'PAUSED';
  }

  const deadline = new Date(ticket.slaResolutionDeadline).getTime();
  const created = new Date(ticket.createdAt).getTime();
  const current = now.getTime();

  if (current >= deadline) {
    return 'BREACHED';
  }

  const totalDuration = deadline - created;
  const elapsed = current - created;
  const percentElapsed = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;

  if (percentElapsed >= 80) {
    return 'CRITICAL';
  }
  if (percentElapsed >= 50) {
    return 'AT_RISK';
  }
  return 'SAFE';
}

async function checkAllActiveSlaStates() {
  const activeTickets = await Ticket.find({
    status: { $in: ['NEW', 'OPEN', 'IN_PROGRESS'] },
    deletedAt: null
  });

  const now = new Date();

  for (const ticket of activeTickets) {
    const previousState = ticket.slaState;
    const newState = evaluateSlaState(ticket, now);

    if (previousState !== newState) {
      ticket.slaState = newState;
      if (newState === 'BREACHED' && !ticket.breachedAt) {
        ticket.breachedAt = now;
      }

      await ticket.save();

      const timeRemainingMinutes = Math.max(0, Math.floor((new Date(ticket.slaResolutionDeadline) - now) / 60000));
      await SLAEvent.create({
        organizationId: ticket.organizationId,
        ticketId: ticket._id,
        eventType: `SLA_${newState}`,
        previousState,
        newState,
        deadlineSnapshot: ticket.slaResolutionDeadline,
        timeRemainingMinutes,
        triggerSource: 'SYSTEM_DAEMON'
      });

      if (['CRITICAL', 'BREACHED'].includes(newState)) {
        if (ticket.assignedAgentId) {
          await Notification.create({
            organizationId: ticket.organizationId,
            recipientId: ticket.assignedAgentId,
            type: newState === 'BREACHED' ? 'SLA_BREACHED' : 'SLA_CRITICAL',
            title: `SLA ${newState}: Ticket #${ticket.ticketId}`,
            message: `Ticket #${ticket.ticketId} (${ticket.title}) has reached ${newState} SLA state. Immediate action required.`,
            resourceType: 'TICKET',
            resourceId: ticket._id,
            idempotencyKey: `sla_${newState}_${ticket._id}_${now.toISOString().slice(0, 13)}`
          });
        }
      }
    }
  }
}

module.exports = {
  calculateDeadline,
  resolveSlaTargets,
  evaluateSlaState,
  checkAllActiveSlaStates
};
