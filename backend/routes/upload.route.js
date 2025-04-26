const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller.js');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// All routes require authentication
router.use(ensureAuthenticated);

// Upload and process images
router.post(
  '/',
  uploadController.uploadMiddleware,
  uploadController.processUpload
);

// Get image by ID
router.get('/image/:imageId', uploadController.getImage);

// Get upload status
router.get('/:uploadId', uploadController.getUploadStatus);

module.exports = router;