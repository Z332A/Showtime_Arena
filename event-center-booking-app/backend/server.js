// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const bookingRoutes = require('./routes/booking');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB first
connectDB()
  .then(() => {
    // Once connected, start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // We already log/exit in db.js if connection fails,
    // but you could log here as well if desired.
    console.error('DB connection promise rejected:', err);
  });

// Routes
app.use('/api/bookings', bookingRoutes);

// Optional default route
app.get('/', (req, res) => {
  res.send('Event Center Booking API is running...');
});
