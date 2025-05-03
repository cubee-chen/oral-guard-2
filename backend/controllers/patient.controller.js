// controllers/patient.controller.js
const User = require('../models/user.model.js');
const Duty = require('../models/duty.model.js');
const Upload = require('../models/upload.model.js');

// Get patient's own profile
exports.getProfile = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    // Get patient with worker and facility information
    const patient = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'worker',
        select: 'firstName lastName email specialization'
      });
    
    // Get worker's facility info if available
    if (patient.worker) {
      const workerWithFacility = await User.findById(patient.worker._id)
        .populate({
          path: 'facility',
          select: 'firstName lastName email'
        });
        
      if (workerWithFacility && workerWithFacility.facility) {
        patient.facility = workerWithFacility.facility;
      }
    }
    
    res.status(200).json({ patient });
    
  } catch (error) {
    next(error);
  }
};

// Get patient's duty history (hygiene records)
exports.getDutyHistory = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    // Get limit parameter or default to 30
    const limit = parseInt(req.query.limit) || 30;
    
    // Get duties with hygiene scores
    const duties = await Duty.find({ 
      patient: req.user._id,
      hygieneScore: { $ne: null }
    })
    .sort({ date: -1 })
    .limit(limit)
    .populate('worker', 'firstName lastName');
    
    // Format data for time series chart
    const chartData = {
      dates: [],
      hygieneScores: [],
      workers: []
    };
    
    duties.forEach(duty => {
      // Format date as YYYY-MM-DD for chart
      const dateStr = new Date(duty.date).toISOString().split('T')[0];
      
      chartData.dates.unshift(dateStr);
      chartData.hygieneScores.unshift(duty.hygieneScore);
      
      const workerName = duty.worker 
        ? `${duty.worker.firstName} ${duty.worker.lastName}`
        : 'Unknown Worker';
      
      chartData.workers.unshift(workerName);
    });
    
    // Get the most recent duty with AI comments
    const mostRecentDuty = duties.length > 0 ? duties[0] : null;
    
    res.status(200).json({ 
      chartData,
      mostRecentDuty
    });
    
  } catch (error) {
    next(error);
  }
};

// Get details of a specific duty
exports.getDutyDetails = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    const { dutyId } = req.params;
    
    // Get duty details and verify it belongs to this patient
    const duty = await Duty.findOne({
      _id: dutyId,
      patient: req.user._id
    })
    .populate('worker', 'firstName lastName email')
    .populate('upload');
    
    if (!duty) {
      return res.status(404).json({ message: 'Record not found or does not belong to you' });
    }
    
    // If there's an upload, get the processed images
    let processedImages = null;
    
    if (duty.upload) {
      const upload = await Upload.findById(duty.upload);
      
      if (upload && upload.status === 'completed') {
        processedImages = {
          leftProfileImage: upload.processedLeftImage || upload.leftProfileImage,
          frontalImage: upload.processedFrontalImage || upload.frontalImage,
          rightProfileImage: upload.processedRightImage || upload.rightProfileImage
        };
      }
    }
    
    res.status(200).json({ 
      duty,
      processedImages
    });
    
  } catch (error) {
    next(error);
  }
};

// Get today's care status
exports.getTodayCareStatus = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can access this resource.' });
    }
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's duty if it exists
    const duty = await Duty.findOne({
      patient: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    })
    .populate('worker', 'firstName lastName email');
    
    if (!duty) {
      return res.status(200).json({ 
        hasDuty: false,
        message: 'No care scheduled for today yet'
      });
    }
    
    res.status(200).json({ 
      hasDuty: true,
      duty
    });
    
  } catch (error) {
    next(error);
  }
};