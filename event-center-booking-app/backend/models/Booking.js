// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  phoneNumber: {  // Changed from "contact" to "phoneNumber"
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endDate: {  // Storing end date (as provided by the frontend)
    type: Date,
    required: true,
  },
  hoursPerSession: {
    type: Number,
    required: true,
    min: 2,
  },
  sessionsCount: {  // Changed from "numberOfSessions" to "sessionsCount"
    type: Number,
    required: true,
    min: 1,
  },
  wantMediaServices: {
    type: Boolean,
    default: false,
  },
  needLEDScreen: {
    type: Boolean,
    default: false,
  },
  needSoundEquipment: {
    type: Boolean,
    default: false,
  },
  ownDrinks: {
    type: Boolean,
    default: false,
  },
  requireStreaming: {
    type: Boolean,
    default: false,
  },
  priceBreakdown: {
    type: mongoose.Schema.Types.Mixed, // Accepts an object of any shape
    required: true,
  },
  status: {
    type: String,
    default: 'Pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
