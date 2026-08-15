const { z } = require('zod');

const createUserSchema = {
  body: z.object({
    email: z.string().email('Invalid email format').toLowerCase().trim(),
    firstName: z.string().min(1, 'First name is required').max(50).trim(),
    lastName: z.string().min(1, 'Last name is required').max(50).trim(),
    role: z.enum(['AGENT', 'MANAGER', 'ADMIN', 'CUSTOMER']),
    password: z.string().min(8, 'Temporary password must be at least 8 characters')
  })
};

const updateProfileSchema = {
  body: z.object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional()
  })
};

const changeRoleSchema = {
  body: z.object({
    role: z.enum(['CUSTOMER', 'AGENT', 'MANAGER', 'ADMIN'])
  })
};

const changeStatusSchema = {
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'LOCKED'])
  })
};

const userQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    role: z.enum(['CUSTOMER', 'AGENT', 'MANAGER', 'ADMIN']).optional(),
    status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'LOCKED', 'SUSPENDED']).optional(),
    search: z.string().max(100).trim().optional()
  })
};

module.exports = {
  createUserSchema,
  updateProfileSchema,
  changeRoleSchema,
  changeStatusSchema,
  userQuerySchema
};
