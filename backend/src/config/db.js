const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dojo_pulse', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn('[Database Warning] Running in offline/mock mode for API endpoints where database is optional.');
  }
};

module.exports = connectDB;
