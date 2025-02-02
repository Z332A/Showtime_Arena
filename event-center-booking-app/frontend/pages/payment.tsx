// pages/payment.tsx
import React from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import { useRouter } from 'next/router';

// Ensure you have set this environment variable in .env.local and Vercel
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

const PaymentPage: React.FC = () => {
  const router = useRouter();

  // Assume that the total amount to be paid is passed via query string or state.
  // For this example, we’ll assume it’s passed via the query string as "amount".
  // Note: Paystack expects amount in kobo (if NGN), so multiply by 100.
  const { amount } = router.query;
  const paymentAmount = amount ? parseFloat(amount as string) * 100 : 0;

  const handlePayment = () => {
    if (!PAYSTACK_PUBLIC_KEY || paymentAmount <= 0) {
      alert('Invalid payment details.');
      return;
    }

    // @ts-ignore: Paystack is loaded from the inline script
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: 'customer@example.com', // Replace with the user's email or pass from booking data
      amount: paymentAmount, // Amount in kobo
      currency: 'NGN',
      ref: '' + Math.floor(Math.random() * 1000000000 + 1), // Generate a pseudo-unique reference
      callback: function (response: any) {
        // Payment complete, verify on the backend
        alert('Payment successful. Transaction reference: ' + response.reference);
        // Optionally, redirect to a success page
        router.push('/payment-success');
      },
      onClose: function () {
        alert('Payment window closed.');
      },
    });
    handler.openIframe();
  };

  return (
    <Container className="my-5" style={{ maxWidth: '600px' }}>
      <h1 className="mb-4">Payment</h1>
      <Alert variant="info">
        Total Amount: {amount ? parseFloat(amount as string).toLocaleString() : '0'}
      </Alert>
      <Button variant="primary" onClick={handlePayment} className="w-100">
        Pay Now
      </Button>
    </Container>
  );
};

export default PaymentPage;
