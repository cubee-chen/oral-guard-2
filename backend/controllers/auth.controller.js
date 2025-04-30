const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Token = require('../models/resetToken.model.js');

const { signToken } = require('../config/auth.js');
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
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    /* 1. 先把密碼一起撈出來（因為 schema 裡 password select:false） */
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    /* 2. 比對密碼 */
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    /* 3. 產生 JWT */
    const token = signToken(user);

    /* 4. 回傳（先把密碼拿掉） */
    const userData = user.toObject();
    delete userData.password;

    res
      .cookie('oralguard_token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        maxAge: 60 * 60 * 1000 // 1h
      })
      .status(200)
      .json({ user: userData });

  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists we will send a reset link.' });

    // generate single-use token valid for 1 h
    const token = crypto.randomBytes(32).toString('hex');
    await Token.create({
      user : user._id,
      token: crypto.createHash('sha256').update(token).digest('hex'),
      expiresAt: Date.now() + 60 * 60 * 1000
    });

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    // send e-mail – replace with your provider
    const transporter = nodemailer.createTransport({
        host : process.env.SMTP_HOST,      // e.g. 'smtp.gmail.com'
        port : Number(process.env.SMTP_PORT || 587),
        secure: false,                     // true for 465, false for 587/STARTTLS
        auth : {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
    await transporter.sendMail({
      from: '"Dental Care" <no-reply@oralguard>',
      to  : email,
      subject: 'Password reset',
      text: `Reset your password: ${resetURL}`
    });

    res.status(200).json({ message: 'Password reset link sent' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const stored  = await Token.findOne({ token: hashed, expiresAt: { $gt: Date.now() } });
    if (!stored) return res.status(400).json({ message: 'Token invalid or expired' });

    const user = await User.findById(stored.user).select('+password');
    user.password = req.body.password;
    await user.save();
    await stored.deleteOne();

    res.status(200).json({ message: 'Password updated, you can now log in.' });
  } catch (err) { next(err); }
};


// Logout user
exports.logout = (req, res) => {
  res.clearCookie('oralguard_token', { sameSite: 'none', secure:true });
  res.status(200).json({ messsage: 'Logged out' });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.status(200).json({ user: req.user });
};