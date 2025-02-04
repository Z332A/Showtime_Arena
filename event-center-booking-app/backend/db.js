// db.js
require('dotenv').config();
const mongoose = require('mongoose');

// Optional: Log the connection string for debugging (remove in production)
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const connectDB = async () => {
  try {
    // Directly connect using the connection string; these options are no longer needed in recent versions.
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
