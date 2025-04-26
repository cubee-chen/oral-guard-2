const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { Readable } = require('stream');
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
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dental-'));
      const filePath = path.join(tempDir, `file_${fileId}.jpg`);
      
      return new Promise((resolve, reject) => {
        // Open download stream
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
        // Create write stream
        const writeStream = fs.createWriteStream(filePath);
        
        // Pipe download stream to write stream
        downloadStream.pipe(writeStream);
        
        // Handle events
        writeStream.on('finish', () => {
          resolve(filePath);
        });
        
        writeStream.on('error', (error) => {
          reject(error);
        });
      });
    };
    
    // Function to upload processed image to GridFS
    const uploadProcessedImage = async (filePath, originalName) => {
      const fileBuffer = await fs.readFile(filePath);
      
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
    const leftProfilePath = await downloadFile(upload.leftProfileImage);
    const frontalPath = await downloadFile(upload.frontalImage);
    const rightProfilePath = await downloadFile(upload.rightProfileImage);
    
    // Process images with ML model
    // For each image: send to ML API, get processed image and metrics
    const processImage = async (imagePath) => {
      // Create form data
      const formData = new FormData();
      const fileBuffer = await fs.readFile(imagePath);
      const blob = new Blob([fileBuffer]);
      formData.append('image', blob, path.basename(imagePath));
      
      // Send request to ML API
      const response = await axios.post(ML_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'arraybuffer'
      });
      
      // Save processed image
      const processedImagePath = path.join(path.dirname(imagePath), `processed_${path.basename(imagePath)}`);
      await fs.writeFile(processedImagePath, Buffer.from(response.data));
      
      // Get metrics from headers
      const metrics = {
        plaqueCoverage: parseFloat(response.headers['x-plaque-coverage'] || '0'),
        gingivalInflammation: parseFloat(response.headers['x-gingival-inflammation'] || '0'),
        tartar: parseFloat(response.headers['x-tartar'] || '0')
      };
      
      return {
        processedImagePath,
        metrics
      };
    };
    
    // Process all three images
    const leftProfileResult = await processImage(leftProfilePath);
    const frontalResult = await processImage(frontalPath);
    const rightProfileResult = await processImage(rightProfilePath);
    
    // Upload processed images to GridFS
    upload.processedLeftImage = await uploadProcessedImage(
      leftProfileResult.processedImagePath,
      path.basename(leftProfilePath)
    );
    
    upload.processedFrontalImage = await uploadProcessedImage(
      frontalResult.processedImagePath,
      path.basename(frontalPath)
    );
    
    upload.processedRightImage = await uploadProcessedImage(
      rightProfileResult.processedImagePath,
      path.basename(rightProfilePath)
    );
    
    // Calculate average metrics from all three images
    const avgPlaqueCoverage = (
      leftProfileResult.metrics.plaqueCoverage +
      frontalResult.metrics.plaqueCoverage +
      rightProfileResult.metrics.plaqueCoverage
    ) / 3;
    
    const avgGingivalInflammation = (
      leftProfileResult.metrics.gingivalInflammation +
      frontalResult.metrics.gingivalInflammation +
      rightProfileResult.metrics.gingivalInflammation
    ) / 3;
    
    const avgTartar = (
      leftProfileResult.metrics.tartar +
      frontalResult.metrics.tartar +
      rightProfileResult.metrics.tartar
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
    await fs.unlink(leftProfilePath);
    await fs.unlink(frontalPath);
    await fs.unlink(rightProfilePath);
    await fs.unlink(leftProfileResult.processedImagePath);
    await fs.unlink(frontalResult.processedImagePath);
    await fs.unlink(rightProfileResult.processedImagePath);
    
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