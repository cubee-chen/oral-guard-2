// models/duty.model.js
const mongoose = require('mongoose');

const DutySchema = new mongoose.Schema({
  // Patient who received care
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Worker who provided care
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Facility that manages the worker
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Date of the duty
  date: {
    type: Date,
    required: true,
    default: function() {
      // Set to start of current day in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
  },
  // Completed by worker
  completed: {
    type: Boolean,
    default: false
  },
  // Verified by facility
  verified: {
    type: Boolean,
    default: false
  },
  // Oral hygiene score (0-100)
  hygieneScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  // AI-generated comments
  aiComments: {
    type: String,
    default: null
  },
  // Reference to uploaded images
  upload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    default: null
  },
  // Timestamps
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
DutySchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Create compound index for patient + date for quick lookups
DutySchema.index({ patient: 1, date: 1 }, { unique: true });

// Create index for facility + date for daily statistics
DutySchema.index({ facility: 1, date: 1 });

// Create index for worker + date for daily tasks
DutySchema.index({ worker: 1, date: 1 });

module.exports = mongoose.model('Duty', DutySchema);