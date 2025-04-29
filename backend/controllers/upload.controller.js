const mongoose = require('mongoose');
const multer = require('multer');
const { gridFSBucket } = require('../config/db');
const Upload = require('../models/upload.model.js');
const Record = require('../models/record.model.js');
const mlService = require('../services/mlService');
const { Readable } = require('stream');

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload middleware for three images
exports.uploadMiddleware = upload.fields([
  { name: 'leftProfileImage', maxCount: 1 },
  { name: 'frontalImage', maxCount: 1 },
  { name: 'rightProfileImage', maxCount: 1 }
]);

// Process upload
exports.processUpload = async (req, res, next) => {
  try {
    // Verify user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Unauthorized. Only patients can upload images.' });
    }
    
    // Check if all required files are present
    if (!req.files.leftProfileImage || !req.files.frontalImage || !req.files.rightProfileImage) {
      return res.status(400).json({ message: 'All three images are required (left profile, frontal, right profile)' });
    }
    
    // Store files in GridFS
    const bucket = gridFSBucket();
    
    // Function to save file to GridFS
    const saveFileToGridFS = async (file) => {
      return new Promise((resolve, reject) => {
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);
        
        const uploadStream = bucket.openUploadStream(file.originalname, {
          contentType: file.mimetype,
          metadata: {
            patientId: req.user.id,
            uploadDate: new Date()
          }
        });
        
        readableStream.pipe(uploadStream);
        
        uploadStream.on('error', (error) => {
          reject(error);
        });
        
        uploadStream.on('finish', () => {
          resolve(uploadStream.id);
        });
      });
    };
    
    // Save all three images
    const leftProfileImageId = await saveFileToGridFS(req.files.leftProfileImage[0]);
    const frontalImageId = await saveFileToGridFS(req.files.frontalImage[0]);
    const rightProfileImageId = await saveFileToGridFS(req.files.rightProfileImage[0]);
    
    // Create new upload record
    const newUpload = new Upload({
      patient: req.user.id,
      leftProfileImage: leftProfileImageId,
      frontalImage: frontalImageId,
      rightProfileImage: rightProfileImageId,
      status: 'pending'
    });
    
    await newUpload.save();
    
    // Process images with ML model (async)
    mlService.processImages(newUpload._id)
      .then(() => {
        console.log(`Processing completed for upload ${newUpload._id}`);
      })
      .catch((err) => {
        console.error(`Error processing upload ${newUpload._id}:`, err);
      });
    
    res.status(201).json({
      message: 'Images uploaded successfully. Processing will begin shortly.',
      uploadId: newUpload._id
    });
    
  } catch (error) {
    next(error);
  }
};

// Get image by ID
exports.getImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    
    // authentication already handled by ensureAuthenticated middleware
    
    // Get the image file
    const bucket = gridFSBucket();
    
    // Check if file exists
    const file = await mongoose.connection.db.collection('uploads.files').findOne({ _id: new mongoose.Types.ObjectId(imageId) });
    
    if (!file) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // For patients, verify they own the image
    if (req.user.role === 'patient') {
      if (file.metadata && file.metadata.patientId !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized. This image does not belong to you.' });
      }
    }
    
    // For dentists, verify the image belongs to one of their patients
    if (req.user.role === 'dentist') {
      if (file.metadata && file.metadata.patientId) {
        const patient = await mongoose.model('User').findOne({
          _id: file.metadata.patientId,
          dentist: req.user.id
        });
        
        if (!patient) {
          return res.status(403).json({ message: 'Unauthorized. This image does not belong to one of your patients.' });
        }
      }
    }
    
    // Set content type
    res.set('Content-Type', file.contentType);
    
    // Create download stream
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(imageId));
    
    // Pipe the file to the response
    downloadStream.pipe(res);
    
  } catch (error) {
    next(error);
  }
};

// Get upload status
exports.getUploadStatus = async (req, res, next) => {
  try {
    const { uploadId } = req.params;
    
    // Verify user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get upload
    const upload = await Upload.findById(uploadId).populate('comment');
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // For patients, verify they own the upload
    if (req.user.role === 'patient' && upload.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized. This upload does not belong to you.' });
    }
    
    // For dentists, verify the upload belongs to one of their patients
    if (req.user.role === 'dentist') {
      const patient = await mongoose.model('User').findOne({
        _id: upload.patient,
        dentist: req.user.id
      });
      
      if (!patient) {
        return res.status(403).json({ message: 'Unauthorized. This upload does not belong to one of your patients.' });
      }
    }
    
    res.status(200).json({ upload });
    
  } catch (error) {
    next(error);
  }
};