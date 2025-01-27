// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const bookingRoutes = require('./routes/booking');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Attempt to connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected');

    // Once connected, start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Stop the app if DB connection fails
  });

// Routes
app.use('/api/bookings', bookingRoutes);

// Optional default route (for sanity check)
app.get('/', (req, res) => {
  res.send('Event Center Booking API is running...');
});
