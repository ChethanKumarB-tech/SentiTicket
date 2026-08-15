const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');

async function addComment(ticket, author, { content, type, attachments = [] }, ipAddress) {
  let commentType = type;

  if (author.role === 'CUSTOMER') {
    if (type === 'INTERNAL') {
      throw AppError.forbidden('Customers cannot create internal notes', 'FORBIDDEN_INTERNAL_COMMENT');
    }
    commentType = 'CUSTOMER';
  } else if (!commentType) {
    commentType = 'AGENT';
  }

  const comment = await Comment.create({
    ticketId: ticket._id,
    organizationId: ticket.organizationId,
    authorId: author._id,
    type: commentType,
    content,
    attachments
  });

  if (['AGENT', 'MANAGER', 'ADMIN'].includes(author.role) && commentType !== 'INTERNAL') {
    if (!ticket.firstRespondedAt) {
      ticket.firstRespondedAt = new Date();
      if (ticket.status === 'NEW' || ticket.status === 'OPEN') {
        ticket.status = 'IN_PROGRESS';
      }
      await ticket.save();
    }
  }

  if (commentType !== 'INTERNAL') {
    const isAuthorCustomer = author.role === 'CUSTOMER';
    const recipientId = isAuthorCustomer ? ticket.assignedAgentId : ticket.customerId;

    if (recipientId && recipientId.toString() !== author._id.toString()) {
      await Notification.create({
        organizationId: ticket.organizationId,
        recipientId,
        type: 'COMMENT_ADDED',
        title: `New Reply on Ticket #${ticket.ticketId}`,
        message: `${author.firstName} ${author.lastName} replied: "${content.slice(0, 80)}..."`,
        resourceType: 'TICKET',
        resourceId: ticket._id
      });
    }
  }

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: author._id,
    actorRole: author.role,
    action: 'COMMENT_ADDED',
    resourceType: 'TICKET',
    resourceId: ticket._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { commentId: comment._id, commentType }
  });

  return comment.populate('authorId', 'firstName lastName role email');
}

async function listTicketComments(ticket, actor) {
  const filter = {
    ticketId: ticket._id,
    organizationId: ticket.organizationId
  };

  if (actor.role === 'CUSTOMER') {
    filter.type = { $ne: 'INTERNAL' };
  }

  const comments = await Comment.find(filter)
    .populate('authorId', 'firstName lastName role email')
    .sort({ createdAt: 1 });

  return comments;
}

module.exports = {
  addComment,
  listTicketComments
};
