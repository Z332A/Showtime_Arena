import React, { useState } from 'react';
import axios from 'axios';

export default function NewBookingPage() {
  // State for form fields
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [startTime, setStartTime] = useState('');
  const [numberOfSessions, setNumberOfSessions] = useState(1);

  // This function handles form submission and sends a POST request to your backend.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // POST request to create a new booking
      await axios.post('https://showtime-arena.onrender.com/api/booking', {
        customerName,
        contact,
        startTime,
        numberOfSessions,
      });

      alert('Booking created successfully!');

      // Optionally reset form fields
      setCustomerName('');
      setContact('');
      setStartTime('');
      setNumberOfSessions(1);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Check console/logs for more details.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      <h1>Create a New Booking</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>
            Customer Name:
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>
            Contact:
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>
            Start Time:
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>
            Number of 30-min Sessions:
          </label>
          <input
            type="number"
            value={numberOfSessions}
            onChange={(e) => setNumberOfSessions(parseInt(e.target.value, 10))}
            min={1}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <button type="submit" style={{ padding: '0.75rem 1.5rem' }}>
          Create Booking
        </button>
      </form>
    </div>
  );
}
