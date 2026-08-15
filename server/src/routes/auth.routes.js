const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  mfaVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/mfa/verify', authLimiter, validate(mfaVerifySchema), authController.verifyMfa);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

router.get('/me', authenticate, authController.getMe);

module.exports = router;
