const mongoose = require('mongoose');

const RecordEntrySchema = new mongoose.Schema({
  uploadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  plaqueCoverage: {
    type: Number,
    required: true
  },
  gingivalInflammation: {
    type: Number,
    required: true
  },
  tartar: {
    type: Number,
    required: true
  },
  additionalMetrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

const RecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  entries: [RecordEntrySchema],
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
RecordSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Record', RecordSchema);