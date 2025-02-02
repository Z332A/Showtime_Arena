const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  numberOfSessions: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  status: {
    type: String,
    required: true,
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
