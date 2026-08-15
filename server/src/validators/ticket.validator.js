const { z } = require('zod');

const createTicketSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
    description: z.string().min(10, 'Description must be at least 10 characters').max(10000).trim(),
    category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'SECURITY', 'GENERAL']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    tags: z.array(z.string().max(30)).max(10).optional()
  })
};

const updateTicketSchema = {
  body: z.object({
    title: z.string().min(3).max(200).trim().optional(),
    description: z.string().min(10).max(10000).trim().optional(),
    tags: z.array(z.string().max(30)).max(10).optional()
  })
};

const ticketStatusSchema = {
  body: z.object({
    status: z.enum(['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED']),
    reason: z.string().max(500).trim().optional()
  })
};

const ticketPrioritySchema = {
  body: z.object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    reason: z.string().min(3, 'Reason for priority change is required').max(500).trim()
  })
};

const assignTicketSchema = {
  body: z.object({
    assignedAgentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid agent ID format')
  })
};

const escalateTicketSchema = {
  body: z.object({
    reason: z.string().min(5, 'Escalation reason is required').max(500).trim(),
    targetTier: z.number().int().min(1).max(5).default(1)
  })
};

const ticketQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['NEW', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    category: z.enum(['TECHNICAL', 'BILLING', 'FEATURE_REQUEST', 'SECURITY', 'GENERAL']).optional(),
    slaState: z.enum(['SAFE', 'AT_RISK', 'CRITICAL', 'BREACHED', 'PAUSED']).optional(),
    assignedAgentId: z.string().optional(),
    isAssigned: z.coerce.boolean().optional(),
    search: z.string().max(100).trim().optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'slaResolutionDeadline']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
};

module.exports = {
  createTicketSchema,
  updateTicketSchema,
  ticketStatusSchema,
  ticketPrioritySchema,
  assignTicketSchema,
  escalateTicketSchema,
  ticketQuerySchema
};
