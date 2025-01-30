// types/Booking.ts
export interface Booking {
    _id: string;
    customerName: string;
    contact: string;
    startTime: string; // Consider using Date type if applicable
    endTime: string;   // Consider using Date type if applicable
    numberOfSessions: number;
  }
  