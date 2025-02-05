// pages/payment.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { Container, Button } from 'react-bootstrap';

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const {
    customerName,
    amount,
    phoneNumber,
    email,
    startDate,
    endDate,
    startHour,
    startMinute,
    startPeriod,
    hoursPerSession,
    sessionsCount,
    wantMediaServices,
    needLEDScreen,
    needSoundEquipment,
    ownDrinks,
    requireStreaming,
  } = router.query;

  // Extract first name from customerName
  const fullName = customerName ? customerName.toString() : 'Customer';
  const firstName = fullName.split(' ')[0];

  // Total amount is expected to be passed (in Naira). Format it.
  const totalAmount = amount ? Number(amount) : 0;
  const formattedTotal = '₦ ' + totalAmount.toLocaleString('en-NG');

  return (
    <Container className="my-5" style={{ maxWidth: '600px' }}>
      <h1>{`Hi, ${firstName}, Almost There!`}</h1>
      <p>
        Thank you for choosing Showtime Arena—where unforgettable moments come to life! 🌟
      </p>
      <p>You're just one step away from securing your spot!</p>
      <p>
        Please click the "Pay Now" button below to securely complete your payment through our trusted payment gateway.
        Once your payment is confirmed, your booking will be finalized and a confirmation email will be sent to you.
      </p>
      <h3>Amount Due: {formattedTotal}</h3>

      <Button
        variant="primary"
        className="w-100"
        onClick={() => {
          // Insert your payment gateway integration here (e.g., trigger Paystack)
          alert("Payment functionality not implemented in this demo.");
        }}
      >
        Pay Now
      </Button>

      <div className="mt-3">
        <p>
          If you have any questions or need assistance, please contact our support team at{' '}
          <a href="mailto:askshowtime@sffl.football">askshowtime@sffl.football</a> or call{' '}
          <a href="tel:+234-916-986-7335">+234-916-986-7335</a>.
        </p>
        <p>
          We appreciate your business and look forward to hosting your event at Showtime Arena!
        </p>
      </div>

      <Button
        variant="secondary"
        className="mt-3"
        onClick={() => {
          // Navigate back to New Booking page in Step 2 with all order details preserved.
          router.push({
            pathname: '/new-booking',
            query: {
              step: '2',
              customerName,
              phoneNumber,
              email,
              startDate,
              endDate,
              startHour,
              startMinute,
              startPeriod,
              hoursPerSession,
              sessionsCount,
              wantMediaServices,
              needLEDScreen,
              needSoundEquipment,
              ownDrinks,
              requireStreaming,
              amount,
            },
          });
        }}
      >
        Go Back
      </Button>
    </Container>
  );
};

export default PaymentPage;
