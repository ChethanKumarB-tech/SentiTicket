const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket reference is required'],
      index: true
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization reference is required'],
      index: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: ['CUSTOMER', 'AGENT', 'INTERNAL', 'SYSTEM'],
        message: 'Comment type must be CUSTOMER, AGENT, INTERNAL, or SYSTEM'
      },
      required: [true, 'Comment type is required'],
      index: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [5000, 'Comment content cannot exceed 5000 characters']
    },
    attachments: [
      {
        name: { type: String, required: true },
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true }
      }
    ],
    isEdited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

commentSchema.index({ ticketId: 1, createdAt: 1 });
commentSchema.index({ organizationId: 1, type: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
