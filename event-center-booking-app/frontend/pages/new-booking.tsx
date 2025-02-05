// pages/new-booking.tsx
/* eslint-disable prefer-const */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Table,
} from 'react-bootstrap';
import { useRouter } from 'next/router';

// Simulated availability check function.
// Replace this with a real API call if needed.
const checkAvailability = async (start: Date, end: Date): Promise<number> => {
  // For demonstration, assume all sessions are available.
  return 0;
};

// Compute the number of sessions (occurrences of the start date's day-of-week)
// between two dates (inclusive).
const computeSessionsCount = (startDateStr: string, endDateStr: string): number => {
  if (!startDateStr || !endDateStr) return 0;
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  if (startDate > endDate) return 0;

  const targetDay = startDate.getDay();
  let count = 0;
  let current = new Date(startDate);
  while (current <= endDate) {
    if (current.getDay() === targetDay) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

// Format a date string into "d-mmm-yyyy" (e.g., "1-Feb-2025")
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Get day of week from a date string
const getDayOfWeek = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { weekday: 'long' });
};

// Convert 12-hour time to 24-hour time string.
const convertTo24HourTime = (hour: string, minute: string, period: string): string => {
  let hr = parseInt(hour, 10);
  if (period === 'PM' && hr !== 12) {
    hr += 12;
  } else if (period === 'AM' && hr === 12) {
    hr = 0;
  }
  const hrStr = hr.toString().padStart(2, '0');
  return `${hrStr}:${minute}`;
};

const NewBookingPage: React.FC = () => {
  const router = useRouter();

  // Step state: 1 = Biodata & Availability Check, 2 = Pricing & Additional Services
  const [step, setStep] = useState<number>(1);
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);

  // Booking fields
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>('');     // YYYY-MM-DD

  // Time selections: hour (1-12), minute ("00" or "30"), period ("AM"/"PM")
  const [startHour, setStartHour] = useState<string>('1');
  const [startMinute, setStartMinute] = useState<string>('00');
  const [startPeriod, setStartPeriod] = useState<string>('AM');

  // Number of hours per session; minimum is 2.
  const [hoursPerSession, setHoursPerSession] = useState<number>(2);

  // Additional services
  const [wantMediaServices, setWantMediaServices] = useState<boolean>(false);
  const [needLEDScreen, setNeedLEDScreen] = useState<boolean>(false);
  const [needSoundEquipment, setNeedSoundEquipment] = useState<boolean>(false);
  const [ownDrinks, setOwnDrinks] = useState<boolean>(false);
  const [requireStreaming, setRequireStreaming] = useState<boolean>(false);

  // Derived state & pricing feedback
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const [proceedEnabled, setProceedEnabled] = useState<boolean>(false);
  const [priceBreakdown, setPriceBreakdown] = useState<{
    baseCost: number;
    mediaCost: number;
    ledCost: number;
    soundCost: number;
    drinkCost: number;
    streamingCost: number;
    subtotal: number;
    vat: number;
    total: number;
  }>({
    baseCost: 0,
    mediaCost: 0,
    ledCost: 0,
    soundCost: 0,
    drinkCost: 0,
    streamingCost: 0,
    subtotal: 0,
    vat: 0,
    total: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pricing constants
  const DAY_RATE = 120000;
  const LONG_RATE = 100000;
  const MEDIA_FEE = 200000;
  const LED_FEE = 20000;
  const SOUND_FEE = 20000;
  const DRINK_FEE = 50000;
  const STREAMING_FEE = 150000;
  const VAT_RATE = 0.075;

  // Update sessions count whenever startDate or endDate changes.
  useEffect(() => {
    const count = computeSessionsCount(startDate, endDate);
    setSessionsCount(count);
  }, [startDate, endDate]);

  // Calculate price breakdown.
  const calculatePrice = (sessions: number) => {
    const totalHours = sessions * hoursPerSession;
    const costPerHour = totalHours > 24 ? LONG_RATE : DAY_RATE;
    const baseUnitPrice = hoursPerSession * costPerHour;
    const baseCost = baseUnitPrice * sessions;
    const mediaCost = wantMediaServices ? sessions * MEDIA_FEE : 0;
    const ledCost = needLEDScreen ? sessions * LED_FEE : 0;
    const soundCost = needSoundEquipment ? sessions * SOUND_FEE : 0;
    const drinkCost = ownDrinks ? sessions * DRINK_FEE : 0;
    const streamingCost = requireStreaming ? sessions * STREAMING_FEE : 0;
    const subtotal = baseCost + mediaCost + ledCost + soundCost + drinkCost + streamingCost;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    setPriceBreakdown({
      baseCost,
      mediaCost,
      ledCost,
      soundCost,
      drinkCost,
      streamingCost,
      subtotal,
      vat,
      total,
    });
  };

  // Handler for Availability Check (Step 1)
  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    setAvailabilityMessage('');
    setProceedEnabled(false);

    if (!customerName || !phoneNumber || !email || !startDate || !endDate || !startHour || !startMinute || !startPeriod || !hoursPerSession) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (startDate < todayStr) {
      setError('Start Date cannot be in the past.');
      setLoading(false);
      return;
    }

    if (endDate < startDate) {
      setError('End Date cannot be earlier than Start Date.');
      setLoading(false);
      return;
    }

    try {
      const count = computeSessionsCount(startDate, endDate);
      setSessionsCount(count);
      const unavailableCount = await checkAvailability(new Date(startDate), new Date(endDate));
      let message = '';
      let enableProceed = true;
      if (unavailableCount === 0) {
        message = 'All selected dates are available.';
      } else if (unavailableCount >= count) {
        message = 'None of the selected dates are available.';
        enableProceed = false;
      } else {
        message = `${unavailableCount} session(s) are unavailable. They will be removed from your booking.`;
      }
      setAvailabilityMessage(message);
      setProceedEnabled(enableProceed);
      setOrderConfirmed(false);
      setPriceBreakdown({
        baseCost: 0,
        mediaCost: 0,
        ledCost: 0,
        soundCost: 0,
        drinkCost: 0,
        streamingCost: 0,
        subtotal: 0,
        vat: 0,
        total: 0,
      });
    } catch (err: unknown) {
      console.error('Error checking availability:', err);
      setError('Failed to check availability.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Confirm Order button in Step 2.
  const handleConfirmOrder = () => {
    calculatePrice(sessionsCount);
    setOrderConfirmed(true);
  };

  // Handler for Confirm Booking (Proceed to Payment)
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const combinedStartTime = convertTo24HourTime(startHour, startMinute, startPeriod);
    const startDateTime = new Date(`${startDate}T${combinedStartTime}:00`);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Posting booking data to:', `${API_URL}/api/bookings`);
      const bookingData = {
        customerName,
        phoneNumber,
        email,
        startTime: startDateTime,
        endDate,
        hoursPerSession,
        sessionsCount,
        wantMediaServices,
        needLEDScreen,
        needSoundEquipment,
        ownDrinks,
        requireStreaming,
        priceBreakdown,
      };

      await axios.post(`${API_URL}/api/bookings`, bookingData);
      setSuccess('Booking created successfully!');
      router.push(
        `/payment?amount=${priceBreakdown.total}&customerName=${encodeURIComponent(customerName)}`
      );
    } catch (err: unknown) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5" style={{ maxWidth: '600px' }}>
      <h1 className="mb-4">Create a New Booking</h1>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {step === 1 && (
        <>
          <Form onSubmit={handleCheckAvailability}>
            <Form.Group controlId="customerName" className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="phoneNumber" className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="startDate" className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
              {startDate && (
                <Form.Text className="text-muted">
                  Day of week: {getDayOfWeek(startDate)}
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group controlId="endDate" className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate || new Date().toISOString().split('T')[0]}
              />
              {endDate && (
                <Form.Text className="text-muted">
                  Sessions available: {computeSessionsCount(startDate, endDate)}
                </Form.Text>
              )}
            </Form.Group>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="startHour">
                <Form.Label>Start Hour</Form.Label>
                <Form.Select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const value = (i + 1).toString();
                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} controlId="startMinute">
                <Form.Label>Start Minute</Form.Label>
                <Form.Select
                  value={startMinute}
                  onChange={(e) => setStartMinute(e.target.value)}
                  required
                >
                  <option value="00">00</option>
                  <option value="30">30</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} controlId="startPeriod">
                <Form.Label>AM/PM</Form.Label>
                <Form.Select
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <Form.Group controlId="hoursPerSession" className="mb-3">
              <Form.Label>Number of Hours per Session</Form.Label>
              <Form.Control
                type="number"
                value={hoursPerSession}
                onChange={(e) => setHoursPerSession(parseInt(e.target.value, 10))}
                min={2}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading} className="w-100">
              {loading ? 'Checking Availability...' : 'Check Availability'}
            </Button>
          </Form>
          {availabilityMessage && (
            <Alert variant="info" className="mt-3">
              {availabilityMessage}
            </Alert>
          )}
          {proceedEnabled && (
            <div className="mt-3">
              <Button variant="success" onClick={() => setStep(2)} className="w-100">
                Proceed to Pricing
              </Button>
            </div>
          )}
          {!proceedEnabled && availabilityMessage && availabilityMessage.includes('None') && (
            <Alert variant="danger" className="mt-3">
              The selected dates are not available.
            </Alert>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="mb-3">Price Summary</h2>
          {/* Confirm Order Button */}
          {!orderConfirmed && (
            <Button
              variant="warning"
              onClick={handleConfirmOrder}
              disabled={loading}
              className="w-100 mb-3"
            >
              {loading ? 'Confirming Order...' : 'Confirm Order'}
            </Button>
          )}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-end">Sessions</th>
                <th className="text-end">Unit Price</th>
                <th className="text-end">Amount Payable</th>
                <th>Include</th>
              </tr>
            </thead>
            <tbody>
              {/* Pitch Booking row */}
              <tr>
                <td>
                  Pitch Booking (<em>{formatDate(startDate)} to {formatDate(endDate)}</em>)
                </td>
                <td className="text-end">{sessionsCount}</td>
                <td className="text-end">
                  {(hoursPerSession * (sessionsCount * hoursPerSession > 24 ? LONG_RATE : DAY_RATE)).toLocaleString()}
                </td>
                <td className="text-end">
                  {(hoursPerSession * (sessionsCount * hoursPerSession > 24 ? LONG_RATE : DAY_RATE) * sessionsCount).toLocaleString()}
                </td>
                <td>—</td>
              </tr>
              {/* Separator Row for Additional Services */}
              <tr>
                <td colSpan={5}><strong>Additional Services</strong></td>
              </tr>
              {/* Media Services row */}
              <tr>
                <td>
                  <Form.Check
                    type="checkbox"
                    id="mediaServices"
                    label="Media Services"
                    checked={wantMediaServices}
                    onChange={(e) => {
                      setWantMediaServices(e.target.checked);
                      if (orderConfirmed) calculatePrice(sessionsCount);
                    }}
                  />
                </td>
                <td className="text-end">{sessionsCount}</td>
                <td className="text-end">{MEDIA_FEE.toLocaleString()}</td>
                <td className="text-end">{wantMediaServices ? (sessionsCount * MEDIA_FEE).toLocaleString() : '0'}</td>
                <td>{wantMediaServices ? 'Yes' : 'No'}</td>
              </tr>
              {/* LED Screen row */}
              <tr>
                <td>
                  <Form.Check
                    type="checkbox"
                    id="ledScreen"
                    label="LED Screen"
                    checked={needLEDScreen}
                    onChange={(e) => {
                      setNeedLEDScreen(e.target.checked);
                      if (orderConfirmed) calculatePrice(sessionsCount);
                    }}
                  />
                </td>
                <td className="text-end">{sessionsCount}</td>
                <td className="text-end">{LED_FEE.toLocaleString()}</td>
                <td className="text-end">{needLEDScreen ? (sessionsCount * LED_FEE).toLocaleString() : '0'}</td>
                <td>{needLEDScreen ? 'Yes' : 'No'}</td>
              </tr>
              {/* Sound Equipment row */}
              <tr>
                <td>
                  <Form.Check
                    type="checkbox"
                    id="soundEquipment"
                    label="Sound Equipment"
                    checked={needSoundEquipment}
                    onChange={(e) => {
                      setNeedSoundEquipment(e.target.checked);
                      if (orderConfirmed) calculatePrice(sessionsCount);
                    }}
                  />
                </td>
                <td className="text-end">{sessionsCount}</td>
                <td className="text-end">{SOUND_FEE.toLocaleString()}</td>
                <td className="text-end">{needSoundEquipment ? (sessionsCount * SOUND_FEE).toLocaleString() : '0'}</td>
                <td>{needSoundEquipment ? 'Yes' : 'No'}</td>
              </tr>
              {/* Drinks Corkage row */}
              <tr>
                <td>
                  <Form.Check
                    type="checkbox"
                    id="ownDrinks"
                    label="Drinks Corkage"
                    checked={ownDrinks}
                    onChange={(e) => {
                      setOwnDrinks(e.target.checked);
                      if (orderConfirmed) calculatePrice(sessionsCount);
                    }}
                  />
                </td>
                <td className="text-end">{sessionsCount}</td>
                <td className="text-end">{DRINK_FEE.toLocaleString()}</td>
                <td className="text-end">{ownDrinks ? (sessionsCount * DRINK_FEE).toLocaleString() : '0'}</td>
                <td>{ownDrinks ? 'Yes' : 'No'}</td>
              </tr>
              {/* Streaming Services row */}
              <tr>
                <td>
                  <Form.Check
                    type="checkbox"
                    id="streamingServices"
                    label="Streaming Services"
                    checked={requireStreaming}
                    onChange={(e) => {
                      setRequireStreaming(e.target.checked);
                      if (orderConfirmed) calculatePrice(sessionsCount);
                    }}
                  />
                </td>
                <td className="text-end">{sessionsCount}</td>
                <td className="text-end">{STREAMING_FEE.toLocaleString()}</td>
                <td className="text-end">{requireStreaming ? (sessionsCount * STREAMING_FEE).toLocaleString() : '0'}</td>
                <td>{requireStreaming ? 'Yes' : 'No'}</td>
              </tr>
              {/* Subtotal, VAT, and Total rows (shown after order is confirmed) */}
              {orderConfirmed && (
                <>
                  <tr>
                    <td><strong>Subtotal</strong></td>
                    <td></td>
                    <td></td>
                    <td className="text-end">{priceBreakdown.subtotal.toLocaleString()}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td><strong>VAT (7.5%)</strong></td>
                    <td></td>
                    <td></td>
                    <td className="text-end">{priceBreakdown.vat.toLocaleString()}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td><strong>Total</strong></td>
                    <td></td>
                    <td></td>
                    <td className="text-end">{priceBreakdown.total.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </>
              )}
            </tbody>
          </Table>
          {!orderConfirmed && (
            <Button
              variant="warning"
              type="button"
              onClick={handleConfirmOrder}
              disabled={loading}
              className="w-100 mb-3"
            >
              {loading ? 'Confirming Order...' : 'Confirm Order'}
            </Button>
          )}
          {orderConfirmed && (
            <Button
              variant="success"
              type="button"
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-100"
            >
              {loading ? 'Confirming Booking...' : 'Proceed to Payment'}
            </Button>
          )}
          <Button
            variant="secondary"
            type="button"
            onClick={() => setStep(1)}
            className="w-100 mt-3"
          >
            Back to Availability Check
          </Button>
        </>
      )}
    </Container>
  );
};

export default NewBookingPage;
