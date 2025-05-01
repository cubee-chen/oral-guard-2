// backend/services/mlService.js
const axios = require('axios');
const fs = require('fs');
const fsp = fs.promises;
const FormData = require('form-data');
const path = require('path');
const os = require('os');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
const Upload = require('../models/upload.model.js');
const Record = require('../models/record.model.js');
const { gridFSBucket } = require('../config/db');
const mongoose = require('mongoose');
const sharp = require('sharp');
require('dotenv').config();

// ML API endpoint with timeout and retry configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/predict';
const ML_API_TIMEOUT = parseInt(process.env.ML_API_TIMEOUT || '30000', 10); // 30 second timeout
const ML_API_RETRIES = parseInt(process.env.ML_API_RETRIES || '3', 10); // 3 retries

// Axios instance with retry logic
const apiClient = axios.create({
  timeout: ML_API_TIMEOUT
});

// Add retry interceptor
apiClient.interceptors.response.use(undefined, async (error) => {
  const { config } = error;
  if (!config || !config.retry) {
    return Promise.reject(error);
  }
  
  config.currentRetryCount = config.currentRetryCount || 0;
  
  if (config.currentRetryCount >= config.retry) {
    return Promise.reject(error);
  }
  
  config.currentRetryCount += 1;
  
  // Exponential back-off
  const delay = Math.pow(2, config.currentRetryCount) * 1000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return apiClient(config);
});

// Process images with ML model with optimizations
exports.processImages = async (uploadId) => {
  let tmpDirs = [];
  
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
    
    // Function to download file from GridFS to temp directory with optimizations
    const downloadFile = async (fileId) => {
      // Create temp directory
      const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'dental-'));
      tmpDirs.push(tmpDir); // Store for cleanup later
      
      const dst = path.join(tmpDir, `${fileId}.jpg`);
      
      await pipeline(
        bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId)),
        fs.createWriteStream(dst)
      );

      return dst;
    };
    
    // Function to upload processed image to GridFS with optimization
    const uploadProcessedImage = async (filePath, originalName) => {
      try {
        // Optimize the image before uploading to GridFS
        const fileBuffer = await fsp.readFile(filePath);
        
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
    // For each image: send to ML API, get processed image and metrics
    const processImage = async (imagePath) => {
      try {
        // Create form data
        const form = new FormData();
        form.append('image', await fsp.readFile(imagePath), path.basename(imagePath));
        
        // Send request to ML API with retry configuration
        const response = await apiClient.post(ML_API_URL, form, {
          headers: form.getHeaders(),
          responseType: 'arraybuffer',
          retry: ML_API_RETRIES,
          currentRetryCount: 0
        });
        
        // Save processed image
        const processed = path.join(path.dirname(imagePath), 'processed_' + path.basename(imagePath));
        await fsp.writeFile(processed, Buffer.from(response.data));
        
        return {
          processedImagePath: processed,
          metrics: {
            plaqueCoverage: parseFloat(response.headers['x-plaque-coverage'] || '0'),
            gingivalInflammation: parseFloat(response.headers['x-gingival-inflammation'] || '0'),
            tartar: parseFloat(response.headers['x-tartar'] || '0'),
          }
        };
      } catch (error) {
        console.error(`Error processing image with ML service: ${imagePath}`, error);
        throw error;
      }
    };
    
    // Process all three images in parallel with Promise.allSettled to handle partial failures
    const results = await Promise.allSettled([
      processImage(leftPath),
      processImage(frontPath),
      processImage(rightPath)
    ]);
    
    // Check if all promises were fulfilled
    const allSucceeded = results.every(result => result.status === 'fulfilled');
    const fulfilledResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    if (!allSucceeded) {
      console.warn(`Some image processing failed for upload ${uploadId}. Continuing with available results.`);
    }
    
    if (fulfilledResults.length === 0) {
      throw new Error('All image processing failed');
    }
    
    // Upload processed images to GridFS in parallel
    const uploadPromises = [];
    
    if (results[0].status === 'fulfilled') {
      uploadPromises.push(
        uploadProcessedImage(results[0].value.processedImagePath, path.basename(leftPath))
          .then(id => { upload.processedLeftImage = id; })
      );
    }
    
    if (results[1].status === 'fulfilled') {
      uploadPromises.push(
        uploadProcessedImage(results[1].value.processedImagePath, path.basename(frontPath))
          .then(id => { upload.processedFrontalImage = id; })
      );
    }
    
    if (results[2].status === 'fulfilled') {
      uploadPromises.push(
        uploadProcessedImage(results[2].value.processedImagePath, path.basename(rightPath))
          .then(id => { upload.processedRightImage = id; })
      );
    }
    
    await Promise.all(uploadPromises);
    
    // Calculate average metrics from available results
    const calculateAverage = (metricName) => {
      const values = fulfilledResults.map(result => result.metrics[metricName]);
      const sum = values.reduce((acc, val) => acc + val, 0);
      return sum / values.length;
    };
    
    const avgPlaqueCoverage = calculateAverage('plaqueCoverage');
    const avgGingivalInflammation = calculateAverage('gingivalInflammation');
    const avgTartar = calculateAverage('tartar');
    
    // Update upload with analysis results
    upload.analysisResults = {
      plaqueCoverage: avgPlaqueCoverage,
      gingivalInflammation: avgGingivalInflammation,
      tartar: avgTartar
    };
    
    upload.status = 'completed';
    await upload.save();
    
    // Update patient's record using findOneAndUpdate with upsert
    await Record.findOneAndUpdate(
      { patient: upload.patient },
      {
        $setOnInsert: {
          patient: upload.patient,
          createdAt: new Date()
        },
        $push: {
          entries: {
            uploadId: upload._id,
            date: upload.uploadDate,
            plaqueCoverage: avgPlaqueCoverage,
            gingivalInflammation: avgGingivalInflammation,
            tartar: avgTartar
          }
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );
    
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
        await fsp.rm(dir, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to clean up temp directory: ${dir}`, err);
      }
    }
  }
};