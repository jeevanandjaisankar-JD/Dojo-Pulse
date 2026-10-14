const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      'MONGO_URI is required. Configure the authorized team database.'
    );
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(
      `[Database] MongoDB connected: ${conn.connection.host}`
    );

    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection failed.');
    throw error;
  }
};

module.exports = connectDB;
