const path = require('path');
const attachmentService = require('../services/attachment.service');
const Ticket = require('../models/Ticket');
const AppError = require('../utils/appError');

async function uploadAttachment(req, res, next) {
  try {
    const ticketId = req.body.ticketId;
    if (!ticketId) {
      throw AppError.badRequest('Ticket ID is required for attachment upload');
    }

    const ticket = await Ticket.findOne({
      $or: [{ _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null }, { ticketId: ticketId.toUpperCase() }],
      organizationId: req.user.organizationId,
      deletedAt: null
    });

    if (!ticket) {
      throw AppError.notFound('Ticket not found');
    }

    if (req.user.role === 'CUSTOMER' && ticket.customerId.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('You do not have permission to attach files to this ticket');
    }

    const attachment = await attachmentService.uploadTicketAttachment(req.file, ticket, req.user, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: { attachment }
    });
  } catch (error) {
    next(error);
  }
}

async function downloadAttachment(req, res, next) {
  try {
    const { attachment, filePath } = await attachmentService.getAttachmentForDownload(
      req.params.id,
      req.user.organizationId
    );

    const ticket = await Ticket.findOne({ _id: attachment.ticketId, organizationId: req.user.organizationId });
    if (!ticket) {
      throw AppError.notFound('Associated ticket not found');
    }
    if (req.user.role === 'CUSTOMER' && ticket.customerId.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('You do not have permission to download this attachment');
    }

    res.setHeader('Content-Type', attachment.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.originalFileName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadAttachment,
  downloadAttachment
};
