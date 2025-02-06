// components/Navbar.tsx
import React from 'react';
import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';

const AppNavbar: React.FC = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        {/* Brand linking to home */}
        <Navbar.Brand as={Link} href="/">
          Showtime Arena
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Home */}
            <Nav.Link as={Link} href="/">
              Home
            </Nav.Link>

            {/* Create Booking */}
            <Nav.Link as={Link} href="/new-booking">
              Create Booking
            </Nav.Link>

            {/* Calendar */}
            <Nav.Link as={Link} href="/calendar">
              Calendar
            </Nav.Link>

            {/* View Booking (by reference code) */}
            <Nav.Link as={Link} href="/view-booking">
              View Booking
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
