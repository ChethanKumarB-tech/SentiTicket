const { z } = require('zod');

const createCommentSchema = {
  body: z.object({
    content: z.string().min(1, 'Comment content cannot be empty').max(5000).trim(),
    type: z.enum(['CUSTOMER', 'AGENT', 'INTERNAL']).optional(),
    attachments: z
      .array(
        z.object({
          name: z.string(),
          fileId: z.string().regex(/^[0-9a-fA-F]{24}$/),
          size: z.number(),
          mimeType: z.string()
        })
      )
      .optional()
  })
};

module.exports = {
  createCommentSchema
};
