const jwt = require('jsonwebtoken');

// config/auth.js
exports.signToken = (user) =>
    jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  
  exports.verifyToken = (token) =>
    jwt.verify(token, process.env.JWT_SECRET);
  