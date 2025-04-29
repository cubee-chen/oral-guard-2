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
require('dotenv').config();

// ML API endpoint
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000/predict';

// Process images with ML model
exports.processImages = async (uploadId) => {
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
      const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'dental-'));
      const dst = path.join(tmpDir, `${fileId}.jpg`);
      await pipeline(
        bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId)),
        fs.createWriteStream(dst)
      );

      return dst;
    };
    
    // Function to upload processed image to GridFS
    const uploadProcessedImage = async (filePath, originalName) => {
      const fileBuffer = await fsp.readFile(filePath);
      
      return new Promise((resolve, reject) => {
        const readableStream = new Readable();
        readableStream.push(fileBuffer);
        readableStream.push(null);
        
        const uploadStream = bucket.openUploadStream(`processed_${originalName}`, {
          contentType: 'image/jpeg',
          metadata: {
            patientId: upload.patient.toString(),
            uploadDate: new Date(),
            isProcessed: true
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
    
    // Download all three images
    const [leftPath, frontPath, rightPath] = await Promise.all([
      downloadFile(upload.leftProfileImage),
      downloadFile(upload.frontalImage),
      downloadFile(upload.rightProfileImage)
    ]);
    
    // Process images with ML model
    // For each image: send to ML API, get processed image and metrics
    const processImage = async (imagePath) => {
      // Create form data
      const form = new FormData();
      form.append('image', await fsp.readFile(imagePath), path.basename(imagePath));
      
      // Send request to ML API
      const { data, headers } = await axios.post(ML_API_URL, form, {
        headers: form.getHeaders(),
        responseType: 'arraybuffer'
      });
      
      // Save processed image
      const processed = path.join(path.dirname(imagePath), 'processed_' + path.basename(imagePath));
      await fsp.writeFile(processed, Buffer.from(data));
      
      return {
        processedImagePath: processed,
        metrics: {
          plaqueCoverage:       parseFloat(headers['x-plaque-coverage'] || '0'),
          gingivalInflammation: parseFloat(headers['x-gingival-inflammation'] || '0'),
          tartar:               parseFloat(headers['x-tartar'] || '0'),
        }
      };
    };
    
    // Process all three images
    const [leftRes, frontRes, rightRes] = await Promise.all([
      processImage(leftPath),
      processImage(frontPath),
      processImage(rightPath)
    ]);
    
    // Upload processed images to GridFS
    upload.processedLeftImage = await uploadProcessedImage(
      leftRes.processedImagePath,
      path.basename(leftPath)
    );
    
    upload.processedFrontalImage = await uploadProcessedImage(
      frontRes.processedImagePath,
      path.basename(frontPath)
    );
    
    upload.processedRightImage = await uploadProcessedImage(
      rightRes.processedImagePath,
      path.basename(rightPath)
    );
    
    // Calculate average metrics from all three images
    const avgPlaqueCoverage = (
      leftRes.metrics.plaqueCoverage +
      frontRes.metrics.plaqueCoverage +
      rightRes.metrics.plaqueCoverage
    ) / 3;
    
    const avgGingivalInflammation = (
      leftRes.metrics.gingivalInflammation +
      frontRes.metrics.gingivalInflammation +
      rightRes.metrics.gingivalInflammation
    ) / 3;
    
    const avgTartar = (
      leftRes.metrics.tartar +
      frontRes.metrics.tartar +
      rightRes.metrics.tartar
    ) / 3;
    
    // Update upload with analysis results
    upload.analysisResults = {
      plaqueCoverage: avgPlaqueCoverage,
      gingivalInflammation: avgGingivalInflammation,
      tartar: avgTartar
    };
    
    upload.status = 'completed';
    await upload.save();
    
    // Update patient's record
    await Record.findOneAndUpdate(
      { patient: upload.patient },
      {
        $setOnInsert:{
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
    
    // Clean up temp files
    await Promise.allSettled([
      fsp.rm(leftPath,   { force: true }),
      fsp.rm(frontPath,  { force: true }),
      fsp.rm(rightPath,  { force: true }),
      fsp.rm(leftRes.processedImagePath,  { force: true }),
      fsp.rm(frontRes.processedImagePath, { force: true }),
      fsp.rm(rightRes.processedImagePath, { force: true })
    ]);
    
    return upload;
    
  } catch (error) {
    console.error('Error processing images:', error);
    
    // Update upload status to failed
    await Upload.findByIdAndUpdate(uploadId, {
      status: 'failed',
      errorMessage: error.message
    });
    
    throw error;
  }
};