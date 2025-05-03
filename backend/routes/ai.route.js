// backend/routes/ai.route.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller.js');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// All routes require authentication
router.use(ensureAuthenticated);

// Get AI recommendations for a specific upload
router.get('/:uploadId/recommendations', aiController.getAIRecommendations);

module.exports = router;