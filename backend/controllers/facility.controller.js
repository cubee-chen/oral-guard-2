// controllers/facility.controller.js
const User = require('../models/user.model.js');
const Duty = require('../models/duty.model.js');
const Upload = require('../models/upload.model.js');
const mongoose = require('mongoose');

// Get all workers for a facility
exports.getWorkers = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can access this resource.' });
    }
    
    // Find all workers associated with this facility
    const workers = await User.find({ 
      facility: req.user._id,
      role: 'worker'
    }).select('-password');
    
    res.status(200).json({ workers });
    
  } catch (error) {
    next(error);
  }
};

// Add a worker to facility's list
exports.addWorker = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can add workers.' });
    }
    
    const { email, password, firstName, lastName, specialization, licenseNumber } = req.body;
    
    // Check if worker already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // If worker exists but already has a facility
      if (existingUser.facility) {
        return res.status(409).json({ message: 'Worker already associated with another facility' });
      }
      
      // Update existing worker to associate with this facility
      existingUser.facility = req.user._id;
      await existingUser.save();
      
      // Add worker to facility's list
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { workers: existingUser._id } }
      );
      
      const workerObject = existingUser.toObject();
      delete workerObject.password;
      
      return res.status(200).json({
        message: 'Existing worker added to your facility',
        worker: workerObject
      });
    }
    
    // Create new worker
    const newWorker = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'worker',
      specialization: specialization || null,
      licenseNumber: licenseNumber || null,
      facility: req.user._id
    });
    
    await newWorker.save();
    
    // Add worker to facility's list
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { workers: newWorker._id } }
    );
    
    const workerObject = newWorker.toObject();
    delete workerObject.password;
    
    res.status(201).json({
      message: 'New worker created and added to your facility',
      worker: workerObject
    });
    
  } catch (error) {
    next(error);
  }
};

// Remove a worker from facility's list
exports.removeWorker = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can remove workers.' });
    }
    
    const { workerId } = req.params;
    
    // Verify worker exists and is associated with this facility
    const worker = await User.findOne({
      _id: workerId,
      facility: req.user._id
    });
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found or not associated with your facility' });
    }
    
    // Remove facility reference from worker
    worker.facility = null;
    await worker.save();
    
    // Remove worker from facility's list
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { workers: worker._id } }
    );
    
    res.status(200).json({ message: 'Worker removed from your facility successfully' });
    
  } catch (error) {
    next(error);
  }
};

// Get patients for a specific worker
exports.getWorkersPatients = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can access this resource.' });
    }
    
    const { workerId } = req.params;
    
    // Verify worker exists and is associated with this facility
    const worker = await User.findOne({
      _id: workerId,
      facility: req.user._id
    });
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found or not associated with your facility' });
    }
    
    // Find all patients associated with this worker
    const patients = await User.find({ 
      worker: workerId,
      role: 'patient'
    }).select('-password');
    
    res.status(200).json({ patients });
    
  } catch (error) {
    next(error);
  }
};

// Add a patient to a worker's list
exports.addPatientToWorker = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can add patients to workers.' });
    }
    
    const { workerId } = req.params;
    const { email, password, firstName, lastName, dateOfBirth } = req.body;
    
    // Verify worker exists and is associated with this facility
    const worker = await User.findOne({
      _id: workerId,
      facility: req.user._id
    });
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found or not associated with your facility' });
    }
    
    // Check if patient already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // If patient exists but already has a worker
      if (existingUser.worker) {
        return res.status(409).json({ message: 'Patient already associated with another worker' });
      }
      
      // Update existing patient to associate with this worker
      existingUser.worker = workerId;
      await existingUser.save();
      
      // Add patient to worker's list
      await User.findByIdAndUpdate(
        workerId,
        { $addToSet: { patients: existingUser._id } }
      );
      
      const patientObject = existingUser.toObject();
      delete patientObject.password;
      
      return res.status(200).json({
        message: 'Existing patient added to worker',
        patient: patientObject
      });
    }
    
    // Create new patient
    const newPatient = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'patient',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      worker: workerId
    });
    
    await newPatient.save();
    
    // Add patient to worker's list
    await User.findByIdAndUpdate(
      workerId,
      { $addToSet: { patients: newPatient._id } }
    );
    
    const patientObject = newPatient.toObject();
    delete patientObject.password;
    
    res.status(201).json({
      message: 'New patient created and added to worker',
      patient: patientObject
    });
    
  } catch (error) {
    next(error);
  }
};

// Get daily duties status
exports.getDailyDuties = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can access this resource.' });
    }
    
    // Get date parameter or default to today
    const dateParam = req.query.date;
    const queryDate = dateParam ? new Date(dateParam) : new Date();
    queryDate.setHours(0, 0, 0, 0); // Set to start of day
    
    // Find all duties for this facility on the specified date
    const duties = await Duty.find({ 
      facility: req.user._id,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    })
    .populate('worker', 'firstName lastName')
    .populate('patient', 'firstName lastName')
    .sort({ 'worker': 1, 'patient': 1 });
    
    // Group duties by worker
    const dutyByWorker = {};
    
    for (const duty of duties) {
      const workerId = duty.worker._id.toString();
      
      if (!dutyByWorker[workerId]) {
        dutyByWorker[workerId] = {
          worker: {
            _id: workerId,
            firstName: duty.worker.firstName,
            lastName: duty.worker.lastName
          },
          duties: []
        };
      }
      
      dutyByWorker[workerId].duties.push({
        _id: duty._id,
        patient: duty.patient,
        completed: duty.completed,
        verified: duty.verified,
        hygieneScore: duty.hygieneScore
      });
    }
    
    // Convert to array for response
    const result = Object.values(dutyByWorker);
    
    res.status(200).json({ 
      date: queryDate,
      dutyByWorker: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Verify a duty as checked by facility
exports.verifyDuty = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can verify duties.' });
    }
    
    const { dutyId } = req.params;
    
    // Find the duty and verify it belongs to this facility
    const duty = await Duty.findOne({
      _id: dutyId,
      facility: req.user._id
    });
    
    if (!duty) {
      return res.status(404).json({ message: 'Duty not found or not associated with your facility' });
    }
    
    // Check if the duty is completed by worker first
    if (!duty.completed) {
      return res.status(400).json({ message: 'Duty must be completed by worker before verification' });
    }
    
    // Update duty to verified
    duty.verified = true;
    await duty.save();
    
    res.status(200).json({ 
      message: 'Duty verified successfully',
      duty
    });
    
  } catch (error) {
    next(error);
  }
};

// Get hygiene statistics for facility
exports.getHygieneStatistics = async (req, res, next) => {
  try {
    // Verify user is a facility
    if (req.user.role !== 'facility') {
      return res.status(403).json({ message: 'Unauthorized. Only facilities can access this resource.' });
    }
    
    // Get date parameter or default to today
    const dateParam = req.query.date;
    const queryDate = dateParam ? new Date(dateParam) : new Date();
    queryDate.setHours(0, 0, 0, 0); // Set to start of day
    
    // Find all duties for this facility on the specified date that have hygiene scores
    const duties = await Duty.find({ 
      facility: req.user._id,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) // Next day
      },
      hygieneScore: { $ne: null }
    })
    .populate('patient', 'firstName lastName')
    .sort({ hygieneScore: -1 });
    
    // Calculate average score
    let totalScore = 0;
    for (const duty of duties) {
      totalScore += duty.hygieneScore;
    }
    
    const averageScore = duties.length > 0 ? totalScore / duties.length : 0;
    
    // Prepare data for chart display
    const chartData = duties.map(duty => ({
      patientName: `${duty.patient.firstName} ${duty.patient.lastName}`,
      patientId: duty.patient._id,
      hygieneScore: duty.hygieneScore
    }));
    
    res.status(200).json({ 
      date: queryDate,
      totalPatients: duties.length,
      averageScore: parseFloat(averageScore.toFixed(2)),
      chartData
    });
    
  } catch (error) {
    next(error);
  }
};