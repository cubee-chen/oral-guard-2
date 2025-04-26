const passport = require('passport');
const User = require('../models/user.model.js');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, specialization, licenseNumber, dateOfBirth } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Create new user based on role
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role
    };
    
    // Add role-specific fields
    if (role === 'dentist' && specialization) {
      userData.specialization = specialization;
    }
    if (role === 'dentist' && licenseNumber) {
      userData.licenseNumber = licenseNumber;
    }
    if (role === 'patient' && dateOfBirth) {
      userData.dateOfBirth = new Date(dateOfBirth);
    }
    
    // Create and save new user
    const user = new User(userData);
    await user.save();
    
    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userObject
    });
    
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      
      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return res.status(200).json({
        message: 'Logged in successfully',
        user: userObject
      });
    });
  })(req, res, next);
};

// Logout user
exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.status(200).json({ user: req.user });
};