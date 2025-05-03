// backend/controllers/ai.controller.js
const mongoose = require('mongoose');
const { gridFSBucket } = require('../config/db');
const Upload = require('../models/upload.model.js');
const aiService = require('../services/aiService');
const { Readable } = require('stream');

/**
 * Get AI recommendations for a dental image
 */
exports.getAIRecommendations = async (req, res, next) => {
  try {
    const { uploadId } = req.params;
    
    // Verify the upload exists
    const upload = await Upload.findById(uploadId);
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
    
    // Check if we already have AI recommendations stored
    if (upload.aiRecommendations) {
      return res.status(200).json({ recommendations: upload.aiRecommendations });
    }
    
    // Get the frontal image to use for AI analysis
    const imageId = upload.frontalImage;
    const bucket = gridFSBucket();

    // Download the image
    const chunks = [];
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(imageId));
    
    // Collect the chunks
    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    // Process the complete image
    downloadStream.on('end', async () => {
      try {
        // Combine chunks into a single buffer
        const imageBuffer = Buffer.concat(chunks);
        
        // Get AI recommendations
        const recommendations = await aiService.getCachedOrNewRecommendations(imageId.toString(), imageBuffer);
        
        // Store recommendations in the upload document
        upload.aiRecommendations = recommendations;
        await upload.save();
        
        res.status(200).json({ recommendations });
      } catch (error) {
        next(error);
      }
    });
    
    downloadStream.on('error', (error) => {
      next(error);
    });
    
  } catch (error) {
    next(error);
  }
};