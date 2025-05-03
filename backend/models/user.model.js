// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['facility', 'worker', 'patient', 'admin'],
    required: true
  },
  // Fields specific to workers (formerly dentists)
  specialization: {
    type: String,
    trim: true,
    default: null
  },
  licenseNumber: {
    type: String,
    trim: true,
    default: null
  },
  // Fields specific to patients
  dateOfBirth: {
    type: Date,
    default: null
  },
  // For patients, reference to their care worker
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // For workers, reference to their facility
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // For facilities, array of worker IDs
  workers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For workers, array of patient IDs
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on document update
UserSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

/** Instance method to compare passwords */
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);