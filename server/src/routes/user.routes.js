const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');
const { strictMutationLimiter } = require('../middleware/rateLimiter.middleware');
const {
  createUserSchema,
  updateProfileSchema,
  changeRoleSchema,
  changeStatusSchema,
  userQuerySchema
} = require('../validators/user.validator');

const router = express.Router();

router.use(authenticate, enforceTenantScope);

router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

router.get('/', requireRoles('MANAGER', 'ADMIN'), validate(userQuerySchema), userController.listUsers);
router.get('/:id', requireRoles('MANAGER', 'ADMIN'), userController.getUser);

router.post('/', requireRoles('ADMIN'), strictMutationLimiter, validate(createUserSchema), userController.createUser);
router.patch('/:id/role', requireRoles('ADMIN'), strictMutationLimiter, validate(changeRoleSchema), userController.changeRole);
router.patch('/:id/status', requireRoles('ADMIN'), strictMutationLimiter, validate(changeStatusSchema), userController.changeStatus);

module.exports = router;
