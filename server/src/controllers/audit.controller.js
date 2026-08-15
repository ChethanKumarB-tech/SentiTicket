const AuditLog = require('../models/AuditLog');
const SecurityEvent = require('../models/SecurityEvent');

async function listAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const { action, resourceType, result } = req.query;

    const filter = { organizationId: req.user.organizationId };
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (result) filter.result = result;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate('actorId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

async function listSecurityEvents(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const { severity, eventType } = req.query;

    const filter = { organizationId: req.user.organizationId };
    if (severity) filter.severity = severity;
    if (eventType) filter.eventType = eventType;

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      SecurityEvent.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      SecurityEvent.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAuditLogs,
  listSecurityEvents
};
