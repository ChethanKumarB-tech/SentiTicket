const { z } = require('zod');

const priorityRuleSchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  responseTargetMinutes: z.number().int().min(5, 'Response target must be at least 5 minutes'),
  resolutionTargetMinutes: z.number().int().min(15, 'Resolution target must be at least 15 minutes'),
  warningThresholdPercentage: z.number().int().min(10).max(90).default(50),
  criticalThresholdPercentage: z.number().int().min(20).max(95).default(80)
});

const createSlaPolicySchema = {
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    description: z.string().max(500).trim().optional(),
    priorityRules: z.array(priorityRuleSchema).min(1, 'At least one priority rule is required'),
    businessHoursOnly: z.boolean().default(true),
    isDefault: z.boolean().default(false)
  })
};

const updateSlaPolicySchema = {
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    description: z.string().max(500).trim().optional(),
    priorityRules: z.array(priorityRuleSchema).min(1).optional(),
    businessHoursOnly: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional()
  })
};

module.exports = {
  createSlaPolicySchema,
  updateSlaPolicySchema
};
