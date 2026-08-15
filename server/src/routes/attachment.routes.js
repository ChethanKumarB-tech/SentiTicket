const express = require('express');
const attachmentController = require('../controllers/attachment.controller');
const upload = require('../middleware/fileUpload.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { enforceTenantScope } = require('../middleware/tenant.middleware');
const { moderateLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(authenticate, enforceTenantScope);

router.post('/', moderateLimiter, upload.single('file'), attachmentController.uploadAttachment);
router.get('/:id/download', attachmentController.downloadAttachment);

module.exports = router;
