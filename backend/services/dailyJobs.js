// services/dailyJobs.js
const User = require('../models/user.model.js');
const Duty = require('../models/duty.model.js');
const mongoose = require('mongoose');

/**
 * Create daily duties for all patients in the system
 * This should be scheduled to run once per day at midnight
 */
async function createDailyDuties() {
  try {
    console.log('Starting daily duty creation job...');
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find all patients who have an assigned worker
    const patients = await User.find({
      role: 'patient',
      worker: { $ne: null }
    });
    
    console.log(`Found ${patients.length} patients with assigned workers`);
    
    // Create duties for each patient
    let createdCount = 0;
    let errorCount = 0;
    
    for (const patient of patients) {
      try {
        // Get worker data to find facility
        const worker = await User.findById(patient.worker);
        
        if (!worker) {
          console.error(`Worker not found for patient ${patient._id}`);
          errorCount++;
          continue;
        }
        
        if (!worker.facility) {
          console.error(`Worker ${worker._id} is not associated with a facility`);
          errorCount++;
          continue;
        }
        
        // Check if duty already exists for today
        const existingDuty = await Duty.findOne({
          patient: patient._id,
          worker: worker._id,
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
          }
        });
        
        if (existingDuty) {
          console.log(`Duty already exists for patient ${patient._id} and worker ${worker._id}`);
          continue;
        }
        
        // Create new duty
        await Duty.create({
          patient: patient._id,
          worker: worker._id,
          facility: worker.facility,
          date: today,
          completed: false,
          verified: false
        });
        
        createdCount++;
      } catch (error) {
        console.error(`Error creating duty for patient ${patient._id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Daily duty creation completed. Created ${createdCount} duties. Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Error in daily duty creation job:', error);
  }
}

/**
 * Check for overdue duties from yesterday and mark them
 */
async function checkOverdueDuties() {
  try {
    console.log('Starting overdue duties check...');
    
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    // Find all uncompleted duties from yesterday
    const overdueDuties = await Duty.find({
      date: {
        $gte: yesterday,
        $lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000) // End of yesterday
      },
      completed: false
    });
    
    console.log(`Found ${overdueDuties.length} overdue duties from yesterday`);
    
    if (overdueDuties.length > 0) {
      // Here you could implement notifications, reporting, or other actions
      // For example, sending emails to facility managers about missed duties
    }
    
  } catch (error) {
    console.error('Error in overdue duties check:', error);
  }
}

// Export functions for scheduling
module.exports = {
  createDailyDuties,
  checkOverdueDuties
};

// If this file is run directly (e.g., node dailyJobs.js), execute the jobs
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oral-guard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    // Run the jobs
    await createDailyDuties();
    await checkOverdueDuties();
    
    // Close the connection
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
}