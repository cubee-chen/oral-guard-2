const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', ensureAuthenticated, authController.logout);

// Get current user
router.get('/me', ensureAuthenticated, authController.getCurrentUser);

module.exports = router;