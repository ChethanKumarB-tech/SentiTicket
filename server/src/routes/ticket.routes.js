const express = require('express');
const ticketController = require('../controllers/ticket.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');
const { authorizeTicketAccess } = require('../middleware/ownership.middleware');
const { moderateLimiter, strictMutationLimiter } = require('../middleware/rateLimiter.middleware');
const {
  createTicketSchema,
  updateTicketSchema,
  ticketStatusSchema,
  ticketPrioritySchema,
  assignTicketSchema,
  escalateTicketSchema,
  ticketQuerySchema
} = require('../validators/ticket.validator');
const { createCommentSchema } = require('../validators/comment.validator');

const router = express.Router();

router.use(authenticate, enforceTenantScope);

router.get('/', validate(ticketQuerySchema), ticketController.listTickets);
router.post('/', moderateLimiter, validate(createTicketSchema), ticketController.createTicket);

router.get('/:id', authorizeTicketAccess, ticketController.getTicket);
router.patch('/:id', authorizeTicketAccess, moderateLimiter, validate(updateTicketSchema), ticketController.updateTicket);

router.patch('/:id/status', authorizeTicketAccess, requireRoles('AGENT', 'MANAGER', 'ADMIN'), moderateLimiter, validate(ticketStatusSchema), ticketController.updateStatus);

router.patch('/:id/priority', authorizeTicketAccess, requireRoles('MANAGER', 'ADMIN'), strictMutationLimiter, validate(ticketPrioritySchema), ticketController.updatePriority);

router.patch('/:id/assign', authorizeTicketAccess, requireRoles('MANAGER', 'ADMIN'), moderateLimiter, validate(assignTicketSchema), ticketController.assignTicket);
router.post('/:id/claim', authorizeTicketAccess, requireRoles('AGENT'), moderateLimiter, ticketController.claimTicket);
router.post('/:id/auto-assign', authorizeTicketAccess, requireRoles('MANAGER', 'ADMIN'), moderateLimiter, ticketController.autoAssign);

router.patch('/:id/escalate', authorizeTicketAccess, requireRoles('MANAGER', 'ADMIN'), moderateLimiter, validate(escalateTicketSchema), ticketController.escalate);

router.delete('/:id', authorizeTicketAccess, requireRoles('ADMIN'), strictMutationLimiter, ticketController.deleteTicket);

router.get('/:id/comments', authorizeTicketAccess, ticketController.listComments);
router.post('/:id/comments', authorizeTicketAccess, moderateLimiter, validate(createCommentSchema), ticketController.addComment);

module.exports = router;
