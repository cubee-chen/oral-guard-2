// backend/routes/admin.route.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller.js');
const verifyAdmin = require('../middleware/verifyAdmin');

// Secure all admin routes with admin token verification
router.use(verifyAdmin);

// Database management routes
router.delete('/database', adminController.clearDatabase);
router.get('/database/stats', adminController.getDatabaseStats);

module.exports = router;