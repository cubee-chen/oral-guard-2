// backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth.route.js');
const facilityRoutes = require('./routes/facility.route.js');
const workerRoutes = require('./routes/worker.route.js');
const patientRoutes = require('./routes/patient.route.js');
const uploadRoutes = require('./routes/upload.route.js');
const adminRoutes = require('./routes/admin.route.js');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
require('./config/db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());

// Debugging line
app.get('/', (req, res) => res.send('🏥 OralGuard API is running'))

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/facility', facilityRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;