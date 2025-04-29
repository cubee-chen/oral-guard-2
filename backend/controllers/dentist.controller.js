const User = require('../models/user.model.js');
const Upload = require('../models/upload.model.js');
const Comment = require('../models/comment.model.js');
const Record = require('../models/record.model.js');
const mongoose = require('mongoose');

// Get all patients for a dentist
exports.getPatients = async (req, res, next) => {
  try {
    // Verify user is a dentist
    if (req.user.role !== 'dentist') {
      return res.status(403).json({ message: 'Unauthorized. Only dentists can access this resource.' });
    }
    
    // Find all patients associated with this dentist
    const patients = await User.find({ 
      dentist: req.user._id,
      role: 'patient'
    }).select('-password');
    
    res.status(200).json({ patients });
    
  } catch (error) {
    next(error);
  }
};

// Add a patient to dentist's list
exports.addPatient = async (req, res, next) => {
  try {
    // Verify user is a dentist
    if (req.user.role !== 'dentist') {
      return res.status(403).json({ message: 'Unauthorized. Only dentists can add patients.' });
    }
    
    const { email, password, firstName, lastName, dateOfBirth } = req.body;
    
    // Check if patient already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // If patient exists but already has a dentist
      if (existingUser.dentist) {
        return res.status(409).json({ message: 'Patient already associated with another dentist' });
      }
      
      // Update existing patient to associate with this dentist
      existingUser.dentist = req.user._id;
      await existingUser.save();
      
      // Add patient to dentist's list
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { patients: existingUser._id } }
      );
      
      const patientObject = existingUser.toObject();
      delete patientObject.password;
      
      return res.status(200).json({
        message: 'Existing patient added to your list',
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
      dentist: req.user._id
    });
    
    await newPatient.save();
    
    // Add patient to dentist's list
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { patients: newPatient._id } }
    );
    
    // Create empty record for new patient
    await Record.create({
      patient: newPatient._id,
      entries: []
    });
    
    const patientObject = newPatient.toObject();
    delete patientObject.password;
    
    res.status(201).json({
      message: 'New patient created and added to your list',
      patient: patientObject
    });
    
  } catch (error) {
    next(error);
  }
};

// Remove a patient from dentist's list
exports.removePatient = async (req, res, next) => {
  try {
    // Verify user is a dentist
    if (req.user.role !== 'dentist') {
      return res.status(403).json({ message: 'Unauthorized. Only dentists can remove patients.' });
    }
    
    const { patientId } = req.params;
    
    // Verify patient exists and is associated with this dentist
    const patient = await User.findOne({
      _id: patientId,
      dentist: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or not associated with you' });
    }
    
    // Remove dentist reference from patient
    patient.dentist = null;
    await patient.save();
    
    // Remove patient from dentist's list
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { patients: patient._id } }
    );
    
    res.status(200).json({ message: 'Patient removed from your list successfully' });
    
  } catch (error) {
    next(error);
  }
};

// Get patient details including uploads and records
exports.getPatientDetails = async (req, res, next) => {
  try {
    // Verify user is a dentist
    if (req.user.role !== 'dentist') {
      return res.status(403).json({ message: 'Unauthorized. Only dentists can access patient details.' });
    }
    
    const { patientId } = req.params;
    
    // Verify patient exists and is associated with this dentist
    const patient = await User.findOne({
      _id: patientId,
      dentist: req.user._id
    }).select('-password');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or not associated with you' });
    }
    
    // Get patient's uploads
    const uploads = await Upload.find({ patient: patientId })
      .sort({ uploadDate: -1 })
      .populate('comment');
    
    // Get patient's record
    const record = await Record.findOne({ patient: patientId });
    
    res.status(200).json({
      patient,
      uploads,
      record
    });
    
  } catch (error) {
    next(error);
  }
};

// Add a comment to a patient's upload
exports.addComment = async (req, res, next) => {
  try {
    // Verify user is a dentist
    if (req.user.role !== 'dentist') {
      return res.status(403).json({ message: 'Unauthorized. Only dentists can add comments.' });
    }
    
    const { uploadId } = req.params;
    const { content } = req.body;
    
    // Verify upload exists
    const upload = await Upload.findById(uploadId);
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // Verify patient is associated with this dentist
    const patient = await User.findOne({
      _id: upload.patient,
      dentist: req.user._id
    });
    
    if (!patient) {
      return res.status(403).json({ message: 'Unauthorized. Patient not associated with you.' });
    }
    
    // Check if comment already exists
    if (upload.comment) {
      // Update existing comment
      const updatedComment = await Comment.findByIdAndUpdate(
        upload.comment,
        { content, updatedAt: Date.now() },
        { new: true }
      );
      
      return res.status(200).json({
        message: 'Comment updated successfully',
        comment: updatedComment
      });
    }
    
    // Create new comment
    const newComment = new Comment({
      upload: uploadId,
      dentist: req.user._id,
      patient: upload.patient,
      content
    });
    
    await newComment.save();
    
    // Update upload with comment reference
    upload.comment = newComment._id;
    upload.reviewedByDentist = true;
    await upload.save();
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
    
  } catch (error) {
    next(error);
  }
};