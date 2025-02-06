// pages/api/bookings.js
export default function handler(req, res) {
    res.status(200).json([
      // sample data
      { _id: 'abc123', startTime: '2025-02-01T10:00:00.000Z', endTime: '2025-02-01T12:00:00.000Z' },
    ]);
  }
  