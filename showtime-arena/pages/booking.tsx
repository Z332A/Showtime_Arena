import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Use '/api/bookings' if that's your GET route
        const { data } = await axios.get('https://showtime-arena.onrender.com/api/bookings');
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    })();
  }, []);

  return (
    <div>
      <h1>All Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul>
          {bookings.map((b) => (
            <li key={b._id}>
              <strong>{b.customerName}</strong> from {new Date(b.startTime).toLocaleString()} to{' '}
              {new Date(b.endTime).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
