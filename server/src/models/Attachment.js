const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
      index: true
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true
    },
    storageKey: {
      type: String,
      required: true,
      unique: true
    },
    mimeType: {
      type: String,
      required: true
    },
    sizeBytes: {
      type: Number,
      required: true,
      max: [10485760, 'File size cannot exceed 10MB']
    },
    sha256Hash: {
      type: String,
      required: true
    },
    scanStatus: {
      type: String,
      enum: {
        values: ['SCANNING', 'APPROVED', 'REJECTED', 'FAILED'],
        message: 'Invalid scan status'
      },
      default: 'APPROVED',
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

attachmentSchema.index({ ticketId: 1, organizationId: 1 });
attachmentSchema.index({ storageKey: 1 }, { unique: true });

const Attachment = mongoose.model('Attachment', attachmentSchema);

module.exports = Attachment;
