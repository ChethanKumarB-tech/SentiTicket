const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const registerSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: passwordSchema,
    firstName: z.string().min(1, 'First name is required').max(50).trim(),
    lastName: z.string().min(1, 'Last name is required').max(50).trim(),
    organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(100).trim().optional(),
    organizationSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').trim().optional()
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
    organizationSlug: z.string().optional()
  })
};

const mfaVerifySchema = {
  body: z.object({
    mfaToken: z.string().min(1, 'MFA challenge token is required'),
    totpCode: z.string().length(6, 'TOTP code must be exactly 6 digits').regex(/^[0-9]+$/, 'TOTP code must be numeric')
  })
};

const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    organizationSlug: z.string().optional()
  })
};

const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema
  })
};

const verifyEmailSchema = {
  body: z.object({
    token: z.string().min(1, 'Verification token is required')
  })
};

const mfaDisableSchema = {
  body: z.object({
    password: z.string().min(1, 'Password is required to disable MFA'),
    totpCode: z.string().length(6, 'TOTP code must be 6 digits')
  })
};

module.exports = {
  registerSchema,
  loginSchema,
  mfaVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  mfaDisableSchema
};
