const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  patient: {
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
  // ML processing results
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
  // ML analysis results
  analysisResults: {
    plaqueCoverage: {
      type: Number,
      default: null
    },
    gingivalInflammation: {
      type: Number,
      default: null
    },
    tartar: {
      type: Number,
      default: null
    },
    additionalMetrics: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  // Indicates if dentist has reviewed this upload
  reviewedByDentist: {
    type: Boolean,
    default: false
  },
  // Reference to comment if exists
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
});

module.exports = mongoose.model('Upload', UploadSchema);