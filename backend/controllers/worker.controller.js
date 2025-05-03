// controllers/worker.controller.js
const User = require('../models/user.model.js');
const Duty = require('../models/duty.model.js');
const Upload = require('../models/upload.model.js');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const { Readable } = require('stream');
const { gridFSBucket } = require('../config/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Function to save file to GridFS
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

// Get all patients for a worker
exports.getPatients = async (req, res, next) => {
  try {
    // Verify user is a worker
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Unauthorized. Only workers can access this resource.' });
    }
    
    // Find all patients associated with this worker
    const patients = await User.find({ 
      worker: req.user._id,
      role: 'patient'
    }).select('-password');
    
    res.status(200).json({ patients });
    
  } catch (error) {
    next(error);
  }
};

// Get patient details
exports.getPatientDetails = async (req, res, next) => {
  try {
    // Verify user is a worker
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Unauthorized. Only workers can access patient details.' });
    }
    
    const { patientId } = req.params;
    
    // Verify patient exists and is associated with this worker
    const patient = await User.findOne({
      _id: patientId,
      worker: req.user._id
    }).select('-password');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or not associated with you' });
    }
    
    // Check if there's already a duty record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let duty = await Duty.findOne({
      patient: patientId,
      worker: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    });
    
    // If no duty record exists for today, create one
    if (!duty) {
      const workerData = await User.findById(req.user._id);
      
      duty = await Duty.create({
        patient: patientId,
        worker: req.user._id,
        facility: workerData.facility,
        date: today,
        completed: false,
        verified: false
      });
    }
    
    // Get recent uploads for this patient
    const uploads = await Upload.find({ patient: patientId })
      .sort({ uploadDate: -1 })
      .limit(10);
    
    // Get recent duty records to show history
    const duties = await Duty.find({
      patient: patientId,
      worker: req.user._id
    })
    .sort({ date: -1 })
    .limit(14); // Show 2 weeks of history
    
    res.status(200).json({
      patient,
      todayDuty: duty,
      uploads,
      duties
    });
    
  } catch (error) {
    next(error);
  }
};

// Process upload with optimizations
exports.processUpload = async (req, res, next) => {
  try {
    // Verify user is a worker
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Unauthorized. Only workers can upload images.' });
    }
    
    const { patientId } = req.params;
    
    // Verify patient exists and is associated with this worker
    const patient = await User.findOne({
      _id: patientId,
      worker: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or not associated with you' });
    }
    
    // Check if all required files are present
    if (!req.files.leftProfileImage || !req.files.frontalImage || !req.files.rightProfileImage) {
      return res.status(400).json({ message: 'All three images are required (left profile, frontal, right profile)' });
    }
    
    // Find worker's facility
    const workerData = await User.findById(req.user._id);
    if (!workerData.facility) {
      return res.status(400).json({ message: 'Worker is not associated with a facility' });
    }
    
    // Process and save all three images in parallel
    const [leftProfileImageId, frontalImageId, rightProfileImageId] = await Promise.all([
      saveFileToGridFS(req.files.leftProfileImage[0], patientId, `left_${Date.now()}.jpg`),
      saveFileToGridFS(req.files.frontalImage[0], patientId, `front_${Date.now()}.jpg`),
      saveFileToGridFS(req.files.rightProfileImage[0], patientId, `right_${Date.now()}.jpg`)
    ]);
    
    // Create new upload record
    const newUpload = new Upload({
      patient: patientId,
      worker: req.user._id,
      facility: workerData.facility,
      leftProfileImage: leftProfileImageId,
      frontalImage: frontalImageId,
      rightProfileImage: rightProfileImageId,
      status: 'pending'
    });
    
    await newUpload.save();
    
    // Check if there's a duty record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let duty = await Duty.findOne({
      patient: patientId,
      worker: req.user._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    });
    
    // If no duty record exists for today, create one
    if (!duty) {
      duty = await Duty.create({
        patient: patientId,
        worker: req.user._id,
        facility: workerData.facility,
        date: today,
        completed: false,
        verified: false,
        upload: newUpload._id
      });
    } else {
      // Update the existing duty with the upload reference
      duty.upload = newUpload._id;
      await duty.save();
    }
    
    // Update the upload with the duty reference
    newUpload.duty = duty._id;
    await newUpload.save();
    
    // Process images with ML model (in background)
    processImagesWithML(newUpload._id)
      .then(() => {
        console.log(`Processing completed for upload ${newUpload._id}`);
      })
      .catch((err) => {
        console.error(`Error processing upload ${newUpload._id}:`, err);
      });
    
    res.status(201).json({
      message: 'Images uploaded successfully. Processing will begin shortly.',
      uploadId: newUpload._id,
      dutyId: duty._id
    });
    
  } catch (error) {
    next(error);
  }
};

// Mark duty as completed
exports.completeDuty = async (req, res, next) => {
  try {
    // Verify user is a worker
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Unauthorized. Only workers can complete duties.' });
    }
    
    const { dutyId } = req.params;
    
    // Find the duty and verify it belongs to this worker
    const duty = await Duty.findOne({
      _id: dutyId,
      worker: req.user._id
    });
    
    if (!duty) {
      return res.status(404).json({ message: 'Duty not found or not associated with you' });
    }
    
    // Update duty to completed
    duty.completed = true;
    await duty.save();
    
    res.status(200).json({ 
      message: 'Duty marked as completed',
      duty
    });
    
  } catch (error) {
    next(error);
  }
};

// Process images with ML model
const processImagesWithML = async (uploadId) => {
  let tmpDirs = [];
  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';
  
  try {
    // Get upload record
    const upload = await Upload.findById(uploadId);
    if (!upload) {
      throw new Error(`Upload ${uploadId} not found`);
    }
    
    // Update status to processing
    upload.status = 'processing';
    await upload.save();
    
    const bucket = gridFSBucket();
    
    // Function to download file from GridFS to temp directory
    const downloadFile = async (fileId) => {
      // Create temp directory
      const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'dental-'));
      tmpDirs.push(tmpDir); // Store for cleanup later
      
      const dst = path.join(tmpDir, `${fileId}.jpg`);
      
      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(dst);
        bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId)).pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      return dst;
    };
    
    // Function to upload processed image to GridFS
    const uploadProcessedImage = async (filePath, originalName) => {
      try {
        // Optimize the image before uploading to GridFS
        const fileBuffer = await fs.promises.readFile(filePath);
        
        // Use sharp to resize and compress the processed image
        const optimizedBuffer = await sharp(fileBuffer)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        
        return new Promise((resolve, reject) => {
          const readableStream = new Readable();
          readableStream.push(optimizedBuffer);
          readableStream.push(null);
          
          const uploadStream = bucket.openUploadStream(`processed_${originalName}`, {
            contentType: 'image/jpeg',
            chunkSizeBytes: 261120, // 255KB chunks
            metadata: {
              patientId: upload.patient.toString(),
              uploadDate: new Date(),
              isProcessed: true
            }
          });
          
          readableStream.pipe(uploadStream);
          
          uploadStream.on('error', reject);
          uploadStream.on('finish', () => resolve(uploadStream.id));
        });
      } catch (error) {
        console.error('Error optimizing and uploading processed image:', error);
        throw error;
      }
    };
    
    // Download all three images in parallel
    const [leftPath, frontPath, rightPath] = await Promise.all([
      downloadFile(upload.leftProfileImage),
      downloadFile(upload.frontalImage),
      downloadFile(upload.rightProfileImage)
    ]);
    
    // Process images with ML model
    const processImage = async (imagePath) => {
      try {
        const form = new FormData();
        form.append('image', await fs.promises.readFile(imagePath), path.basename(imagePath));
        
        // Call ML service API
        const response = await axios.post(ML_SERVICE_URL, form, {
          headers: form.getHeaders(),
          responseType: 'arraybuffer',
        });
        
        // Save processed image
        const processed = path.join(path.dirname(imagePath), 'processed_' + path.basename(imagePath));
        await fs.promises.writeFile(processed, Buffer.from(response.data));
        
        return {
          processedImagePath: processed,
          hygieneScore: parseInt(response.headers['x-oral-hygiene-score'] || '0'),
          aiComments: response.headers['x-ai-comments'] || ''
        };
      } catch (error) {
        console.error(`Error processing image with ML service: ${imagePath}`, error);
        throw error;
      }
    };
    
    // Process one image first to get the AI comments
    const frontResult = await processImage(frontPath);
    
    // Process the other two images in parallel
    const [leftResult, rightResult] = await Promise.all([
      processImage(leftPath),
      processImage(rightPath)
    ]);
    
    // Upload processed images to GridFS in parallel
    const [processedLeftId, processedFrontId, processedRightId] = await Promise.all([
      uploadProcessedImage(leftResult.processedImagePath, path.basename(leftPath)),
      uploadProcessedImage(frontResult.processedImagePath, path.basename(frontPath)),
      uploadProcessedImage(rightResult.processedImagePath, path.basename(rightPath))
    ]);
    
    // Calculate average hygiene score
    const avgHygieneScore = Math.round(
      (leftResult.hygieneScore + frontResult.hygieneScore + rightResult.hygieneScore) / 3
    );
    
    // Update upload record with processed data
    upload.processedLeftImage = processedLeftId;
    upload.processedFrontalImage = processedFrontId;
    upload.processedRightImage = processedRightId;
    upload.hygieneScore = avgHygieneScore;
    upload.aiComments = frontResult.aiComments; // Use the comments from the front image
    upload.status = 'completed';
    await upload.save();
    
    // Update duty record with hygiene score and AI comments
    if (upload.duty) {
      await Duty.findByIdAndUpdate(upload.duty, {
        hygieneScore: avgHygieneScore,
        aiComments: frontResult.aiComments
      });
    }
    
    return upload;
    
  } catch (error) {
    console.error('Error processing images:', error);
    
    // Update upload status to failed
    await Upload.findByIdAndUpdate(uploadId, {
      status: 'failed',
      errorMessage: error.message
    });
    
    throw error;
  } finally {
    // Clean up temp files
    for (const dir of tmpDirs) {
      try {
        await fs.promises.rm(dir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to clean up temp directory: ${dir}`, err);
      }
    }
  }
};

// Get image by ID
exports.getImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    
    // Verify user role (only workers, patients, or facility staff can access images)
    if (!['worker', 'patient', 'facility'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const bucket = gridFSBucket();
    
    // Check if file exists
    const file = await mongoose.connection.db.collection('uploads.files').findOne({ 
      _id: new mongoose.Types.ObjectId(imageId) 
    });
    
    if (!file) {
      return res.status(404).json({ message: 'Image not found' });
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