// middleware/ensureAuthenticated.js
const { verifyToken } = require('../config/auth');
const User = require('../models/user.model.js');

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies['oralguard_token']; 
    const payload = verifyToken(token);
    // fetch the complete user (without password)
    req.user = await User.findById(payload.id).select('-password');
    if (!req.user) throw new Error('missing');
    next();
  } catch {
    res.status(401).json({message:'Unauthorized'})
  }
};