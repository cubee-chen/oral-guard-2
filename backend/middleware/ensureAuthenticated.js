// middleware/ensureAuthenticated.js
const { verifyToken } = require('../config/auth');
const User = require('../models/user.model.js');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies['oralguard_token']; 
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    const payload = verifyToken(token);
    
    // Fetch the complete user (without password)
    const user = await User.findById(payload.id).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if the role is valid
    if (!['facility', 'worker', 'patient', 'admin'].includes(user.role)) {
      throw new Error('Invalid user role');
    }
    
    // Add user object to request
    req.user = user;
    
    // Add role-specific helper functions
    req.isFacility = user.role === 'facility';
    req.isWorker = user.role === 'worker';
    req.isPatient = user.role === 'patient';
    req.isAdmin = user.role === 'admin';
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({
      message: 'Authentication failed. Please log in again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};