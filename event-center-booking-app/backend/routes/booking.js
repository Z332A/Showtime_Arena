// routes/booking.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// 1. Create a new booking
router.post('/', async (req, res) => {
  try {
    const { customerName, contact, startTime, numberOfSessions } = req.body;

    // Validate required fields
    if (!customerName || !contact || !startTime || !numberOfSessions) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }

    // Calculate endTime based on 30-minute sessions
    const sessionDuration = 30 * 60 * 1000; // 30 minutes in ms
    const startDateTime = new Date(startTime);
    const endTime = new Date(startDateTime.getTime() + numberOfSessions * sessionDuration);

    // Check for overlapping bookings:
    // We consider an overlap if an existing booking's startTime is before the new booking's endTime
    // and its endTime is after the new booking's startTime.
    const overlap = await Booking.findOne({
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (overlap) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Create and save the new booking
    const newBooking = new Booking({
      customerName,
      contact,
      startTime: startDateTime,
      endTime,
      numberOfSessions,
    });

    const savedBooking = await newBooking.save();
    return res.status(201).json(savedBooking);
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    return res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
});

// 3. Get available slots for a given date
router.get('/available', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required.' });
    }

    // Set boundaries for the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      startTime: { $lte: dayEnd },
      endTime: { $gte: dayStart },
    });

    // Generate all 30-minute intervals for the day
    const intervals = [];
    let current = new Date(dayStart);
    while (current < dayEnd) {
      intervals.push(new Date(current));
      current = new Date(current.getTime() + 30 * 60 * 1000);
    }

    // Filter out intervals that overlap with any booking
    const availableSlots = intervals.filter(timeSlot => {
      return !bookings.some(booking => {
        return timeSlot >= booking.startTime && timeSlot < booking.endTime;
      });
    });

    return res.json({ availableSlots });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
});

// 4. Update a booking (admin)
router.put('/:id', async (req, res) => {
  try {
    const { customerName, contact, startTime, numberOfSessions, status } = req.body;

    let endTime;
    if (startTime && numberOfSessions) {
      const sessionDuration = 30 * 60 * 1000;
      endTime = new Date(new Date(startTime).getTime() + numberOfSessions * sessionDuration);
    }

    const updatedFields = {
      ...(customerName && { customerName }),
      ...(contact && { contact }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(numberOfSessions && { numberOfSessions }),
      ...(status && { status }),
    };

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
});

// 5. Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
