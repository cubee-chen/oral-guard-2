const express = require('express');
const router = express.Router();
const dentistController = require('../controllers/dentist.controller.js');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// All routes require authentication
router.use(ensureAuthenticated);

// Get all patients for dentist
router.get('/patients', dentistController.getPatients);

// Add a patient to dentist's list
router.post('/patients', dentistController.addPatient);

// Remove a patient from dentist's list
router.delete('/patients/:patientId', dentistController.removePatient);

// Get patient details including uploads and records
router.get('/patients/:patientId', dentistController.getPatientDetails);

// Add a comment to a patient's upload
router.post('/upload/:uploadId/comment', dentistController.addComment);

module.exports = router;