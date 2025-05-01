// backend/controllers/upload.controller.js
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp'); // Add sharp for image optimization
const { gridFSBucket } = require('../config/db');
const Upload = require('../models/upload.model.js');
const Record = require('../models/record.model.js');
const mlService = require('../services/mlService');
const { Readable } = require('stream');
const path = require('path');

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

// Helper function to optimize image before saving to GridFS
const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 800,     // Max width (preserves aspect ratio)
    quality = 80,    // JPEG quality (1-100)
    format = 'jpeg'  // Output format
  } = options;

  try {
    // Use sharp to resize and compress
    return await sharp(buffer)
      .resize({ width, withoutEnlargement: true }) // Resize only if larger than specified width
      .toFormat(format, { quality })
      .toBuffer();
  } catch (error) {
    console.error('Image optimization error:', error);
    return buffer; // Return original buffer on error
  }
};

// Improved function to save file to GridFS
const saveFileToGridFS = async (file, patientId, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bucket = gridFSBucket();
      
      // Get file extension
      const fileExt = path.extname(file.originalname).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif'].includes(fileExt);
      
      // Optimize image if it's a supported format
      let buffer = file.buffer;
      let contentType = file.mimetype;
      
      if (isImage) {
        buffer = await optimizeImage(file.buffer);
        contentType = 'image/jpeg'; // We convert to JPEG for consistency
      }
      
      // Create readable stream from buffer
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      
      // Generate file name if not provided
      const finalFileName = fileName || `${Date.now()}_${file.originalname}`;
      
      // Open upload stream with optimized chunk size
      const uploadStream = bucket.openUploadStream(finalFileName, {
        contentType: contentType,
        chunkSizeBytes: 261120, // 255KB chunk size
        metadata: {
          patientId,
          uploadDate: new Date(),
          originalName: file.originalname,
          fileSize: buffer.length
        }
      });
      
      // Pipe optimized buffer to GridFS
      readableStream.pipe(uploadStream);
      
      // Handle events
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => resolve(uploadStream.id));
    } catch (error) {
      reject(error);
    }
  });
};

// Process upload with optimizations
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
    
    // Process and save all three images in parallel
    const [leftProfileImageId, frontalImageId, rightProfileImageId] = await Promise.all([
      saveFileToGridFS(req.files.leftProfileImage[0], req.user.id, `left_${Date.now()}.jpg`),
      saveFileToGridFS(req.files.frontalImage[0], req.user.id, `front_${Date.now()}.jpg`),
      saveFileToGridFS(req.files.rightProfileImage[0], req.user.id, `right_${Date.now()}.jpg`)
    ]);
    
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

// Get image by ID with improved caching
exports.getImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    
    // Authentication already handled by ensureAuthenticated middleware
    
    // Get the image file
    const bucket = gridFSBucket();
    
    // Check if file exists
    const file = await mongoose.connection.db.collection('uploads.files').findOne({ 
      _id: new mongoose.Types.ObjectId(imageId) 
    });
    
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
    
    // Set content type and caching headers
    res.set({
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'ETag': `"${file._id}"`,
      'Last-Modified': file.uploadDate.toUTCString()
    });
    
    // Support conditional requests
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];
    
    if (ifNoneMatch === `"${file._id}"` || 
        (ifModifiedSince && new Date(ifModifiedSince) >= file.uploadDate)) {
      return res.status(304).end(); // Not Modified
    }
    
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
    if (!req.isAuthenticated && !req.user) {
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