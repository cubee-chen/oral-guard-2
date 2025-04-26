const User = require('../models/User');
const Upload = require('../models/Upload');
const Record = require('../models/Record');

// Get patient's own profile
exports.getProfile = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    // Get patient with dentist information
    const patient = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'dentist',
        select: 'firstName lastName email specialization'
      });
    
    res.status(200).json({ patient });
    
  } catch (error) {
    next(error);
  }
};

// Get patient's uploads
exports.getUploads = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    // Get all uploads for this patient
    const uploads = await Upload.find({ patient: req.user._id })
      .sort({ uploadDate: -1 })
      .populate('comment');
    
    res.status(200).json({ uploads });
    
  } catch (error) {
    next(error);
  }
};

// Get patient's record (time series data)
exports.getRecord = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    // Get record for this patient
    const record = await Record.findOne({ patient: req.user._id });
    
    if (!record) {
      // Create empty record if none exists
      const newRecord = await Record.create({
        patient: req.user._id,
        entries: []
      });
      
      return res.status(200).json({ record: newRecord });
    }
    
    res.status(200).json({ record });
    
  } catch (error) {
    next(error);
  }
};

// Get a specific upload by ID
exports.getUploadById = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    const { uploadId } = req.params;
    
    // Get upload and verify it belongs to this patient
    const upload = await Upload.findOne({
      _id: uploadId,
      patient: req.user._id
    }).populate('comment');
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    res.status(200).json({ upload });
    
  } catch (error) {
    next(error);
  }
};