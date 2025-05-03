// routes/facility.route.js
const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller.js');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// All routes require authentication
router.use(ensureAuthenticated);

// Worker management routes
router.get('/workers', facilityController.getWorkers);
router.post('/workers', facilityController.addWorker);
router.delete('/workers/:workerId', facilityController.removeWorker);

// Patient management routes
router.get('/workers/:workerId/patients', facilityController.getWorkersPatients);
router.post('/workers/:workerId/patients', facilityController.addPatientToWorker);

// Duty management routes
router.get('/duties/daily', facilityController.getDailyDuties);
router.patch('/duties/:dutyId/verify', facilityController.verifyDuty);

// Statistics routes
router.get('/statistics/hygiene', facilityController.getHygieneStatistics);

module.exports = router;