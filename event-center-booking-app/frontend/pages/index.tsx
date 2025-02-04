// pages/index.tsx
import React from 'react';
import Image from 'next/image';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <Container className="my-5">
      <Row className="align-items-center">
        <Col md={6}>
          <h1>Welcome to Showtime Arena</h1>
          <p>
            Manage your bookings efficiently with our easy-to-use platform. Whether you are scheduling sessions or reviewing past bookings, we have got you covered.
          </p>
          <Link href="/new-booking" passHref>
            <Button variant="primary" size="lg">Create a Booking</Button>
          </Link>
        </Col>
        <Col md={6}>
          <Image 
            src="/booking-illustration.svg" 
            alt="Booking Illustration" 
            width={500} 
            height={300} 
            className="img-fluid" 
          />
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>How It Works</Card.Title>
              {/* Replace Card.Text with a div to avoid nesting <ol> inside a <p> */}
              <div>
                <ol>
                  <li>Create a new booking using the form.</li>
                  <li>View all your bookings in one place.</li>
                  <li>Manage and update your bookings as needed.</li>
                </ol>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
