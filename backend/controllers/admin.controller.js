// backend/controllers/admin.controller.js
const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const Upload = require('../models/upload.model.js');
const Comment = require('../models/comment.model.js');
const Record = require('../models/record.model.js');
const Token = require('../models/resetToken.model.js');
const { gridFSBucket } = require('../config/db');

/**
 * Clear all database collections
 * This is for development purposes only and should be disabled in production
 */
exports.clearDatabase = async (req, res, next) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        message: 'This operation is not allowed in production environment' 
      });
    }
    
    // Delete all GridFS files
    const bucket = gridFSBucket();
    const cursor = bucket.find({});
    const files = await cursor.toArray();
    
    for (const file of files) {
      await bucket.delete(file._id);
    }
    
    // Delete all documents from collections
    await Promise.all([
      User.deleteMany({}),
      Upload.deleteMany({}),
      Comment.deleteMany({}),
      Record.deleteMany({}),
      Token.deleteMany({}),
      // Clean up GridFS collections directly
      mongoose.connection.db.collection('uploads.files').deleteMany({}),
      mongoose.connection.db.collection('uploads.chunks').deleteMany({})
    ]);
    
    res.status(200).json({ 
      message: 'Database cleared successfully',
      deletedCounts: {
        users: await User.countDocuments(),
        uploads: await Upload.countDocuments(),
        comments: await Comment.countDocuments(),
        records: await Record.countDocuments(),
        tokens: await Token.countDocuments(),
        gridFsFiles: await mongoose.connection.db.collection('uploads.files').countDocuments(),
        gridFsChunks: await mongoose.connection.db.collection('uploads.chunks').countDocuments()
      }
    });
    
  } catch (error) {
    console.error('Error clearing database:', error);
    next(error);
  }
};

/**
 * Get database statistics
 */
exports.getDatabaseStats = async (req, res, next) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      uploads: await Upload.countDocuments(),
      comments: await Comment.countDocuments(),
      records: await Record.countDocuments(),
      tokens: await Token.countDocuments(),
      gridFsFiles: await mongoose.connection.db.collection('uploads.files').countDocuments(),
      gridFsChunks: await mongoose.connection.db.collection('uploads.chunks').countDocuments()
    };
    
    res.status(200).json({ stats });
    
  } catch (error) {
    console.error('Error getting database stats:', error);
    next(error);
  }
};