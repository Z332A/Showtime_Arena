// db.js
require('dotenv').config(); // Load environment variables

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the environment variable MONGODB_URI
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
