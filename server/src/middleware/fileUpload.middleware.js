const multer = require('multer');
const env = require('../config/environment');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES,
    files: 5
  }
});

module.exports = upload;
