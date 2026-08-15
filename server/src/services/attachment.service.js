const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sanitize = require('sanitize-filename');
const Attachment = require('../models/Attachment');
const AuditLog = require('../models/AuditLog');
const AppError = require('../utils/appError');
const env = require('../config/environment');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const DISALLOWED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.php',
  '.pl',
  '.cgi',
  '.vbs',
  '.html',
  '.htm',
  '.svg'
];

async function uploadTicketAttachment(file, ticket, uploader, ipAddress) {
  if (!file || !file.buffer) {
    throw AppError.badRequest('No file provided for upload');
  }

  const rawExt = path.extname(file.originalname).toLowerCase();
  if (DISALLOWED_EXTENSIONS.includes(rawExt)) {
    throw AppError.badRequest(`File extension '${rawExt}' is not permitted for security reasons`, 'DISALLOWED_FILE_TYPE');
  }

  const sanitizedName = sanitize(file.originalname).slice(0, 150) || 'attachment';
  const sha256Hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

  if (file.buffer.length > env.MAX_FILE_SIZE_BYTES) {
    throw AppError.badRequest('File size exceeds the 10MB limit', 'FILE_TOO_LARGE');
  }

  const storageFilename = `${crypto.randomUUID()}${rawExt}`;
  const targetDir = path.resolve(process.cwd(), env.UPLOAD_STORAGE_PATH, ticket.organizationId.toString(), ticket._id.toString());

  fs.mkdirSync(targetDir, { recursive: true });

  const absoluteStoragePath = path.join(targetDir, storageFilename);
  fs.writeFileSync(absoluteStoragePath, file.buffer);

  const storageKey = path.relative(process.cwd(), absoluteStoragePath).replace(/\\/g, '/');

  const attachment = await Attachment.create({
    organizationId: ticket.organizationId,
    ticketId: ticket._id,
    uploaderId: uploader._id,
    originalFileName: sanitizedName,
    storageKey,
    mimeType: file.mimetype || 'application/octet-stream',
    sizeBytes: file.buffer.length,
    sha256Hash,
    scanStatus: 'APPROVED'
  });

  await AuditLog.create({
    organizationId: ticket.organizationId,
    actorId: uploader._id,
    actorRole: uploader.role,
    action: 'ATTACHMENT_UPLOADED',
    resourceType: 'ATTACHMENT',
    resourceId: attachment._id.toString(),
    result: 'SUCCESS',
    ipAddress,
    details: { ticketId: ticket.ticketId, originalName: sanitizedName, sizeBytes: file.buffer.length }
  });

  return attachment;
}

async function getAttachmentForDownload(attachmentId, organizationId) {
  const attachment = await Attachment.findOne({ _id: attachmentId, organizationId });
  if (!attachment) {
    throw AppError.notFound('Attachment not found');
  }

  const absolutePath = path.resolve(process.cwd(), attachment.storageKey);
  if (!fs.existsSync(absolutePath)) {
    throw AppError.notFound('Physical file not found on storage server');
  }

  return {
    attachment,
    filePath: absolutePath
  };
}

module.exports = {
  uploadTicketAttachment,
  getAttachmentForDownload
};
