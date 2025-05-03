// routes/worker.route.js
const express = require('express');
const router = express.Router();
const workerController = require('../controllers/worker.controller.js');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// All routes require authentication
router.use(ensureAuthenticated);

// Patient management routes
router.get('/patients', workerController.getPatients);
router.get('/patients/:patientId', workerController.getPatientDetails);

// Upload routes
router.post(
  '/patients/:patientId/upload',
  workerController.uploadMiddleware,
  workerController.processUpload
);

// Duty management routes
router.patch('/duties/:dutyId/complete', workerController.completeDuty);

// Image routes
router.get('/image/:imageId', workerController.getImage);

module.exports = router;