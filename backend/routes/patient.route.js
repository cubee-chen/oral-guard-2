// routes/patient.route.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller.js');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// All routes require authentication
router.use(ensureAuthenticated);

// Profile route
router.get('/profile', patientController.getProfile);

// Duty history routes
router.get('/duties/history', patientController.getDutyHistory);
router.get('/duties/:dutyId', patientController.getDutyDetails);
router.get('/duties/today', patientController.getTodayCareStatus);

module.exports = router;