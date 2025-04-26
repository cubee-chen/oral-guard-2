const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// All routes require authentication
router.use(ensureAuthenticated);

// Get patient's own profile
router.get('/profile', patientController.getProfile);

// Get patient's uploads
router.get('/uploads', patientController.getUploads);

// Get patient's record (time series data)
router.get('/record', patientController.getRecord);

// Get a specific upload by ID
router.get('/upload/:uploadId', patientController.getUploadById);

module.exports = router;