// routes/booking.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// 1. Create new booking
router.post('/', async (req, res) => {
  try {
    const { customerName, contact, startTime, numberOfSessions } = req.body;

    // Calculate endTime based on 30-minute sessions
    const sessionInMs = 30 * 60 * 1000; // 30 minutes
    const endTime = new Date(new Date(startTime).getTime() + numberOfSessions * sessionInMs);

    const newBooking = new Booking({
      customerName,
      contact,
      startTime,
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

// 3. Get available slots
router.get('/available', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date query param is required' });
    }

    // Start/end of the given day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      startTime: { $lte: dayEnd },
      endTime: { $gte: dayStart },
    });

    // Generate all 30-min intervals
    const intervals = [];
    let current = new Date(dayStart);
    while (current < dayEnd) {
      intervals.push(new Date(current));
      current = new Date(current.getTime() + 30 * 60 * 1000);
    }

    // Filter out intervals that fall within any booking
    const availableSlots = intervals.filter((timeSlot) => {
      return !bookings.some((booking) => {
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
      const sessionInMs = 30 * 60 * 1000;
      endTime = new Date(new Date(startTime).getTime() + numberOfSessions * sessionInMs);
    }

    const updatedFields = {
      ...(customerName && { customerName }),
      ...(contact && { contact }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(numberOfSessions && { numberOfSessions }),
      ...(status && { status }),
    };

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, 
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
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Error deleting booking:', err);
    return res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
