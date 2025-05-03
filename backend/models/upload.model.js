// models/upload.model.js
const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  // Patient whose oral images were uploaded
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Worker who uploaded the images
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
  uploadDate: {
    type: Date,
    default: Date.now
  },
  // Store the file IDs from GridFS
  leftProfileImage: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  frontalImage: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rightProfileImage: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // ML processing results (images with bounding boxes)
  processedLeftImage: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  processedFrontalImage: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  processedRightImage: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // Error message if processing failed
  errorMessage: {
    type: String,
    default: null
  },
  // AI analysis results
  hygieneScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  // AI-generated comments about oral health
  aiComments: {
    type: String,
    default: null
  },
  // Associated duty record
  duty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Duty',
    default: null
  }
});

module.exports = mongoose.model('Upload', UploadSchema);