const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-care';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Create bucket for file storage using GridFS
const conn = mongoose.connection;
let gridFSBucket;

conn.once('open', () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS bucket created for file storage');
});

// Export the gridFSBucket to be used in other files
module.exports = {
  gridFSBucket: () => gridFSBucket,
  connection: conn
};