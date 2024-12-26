const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse incoming JSON requests

// Temporary data storage for rooms and bookings
const rooms = [];
const bookings = [];

// Route for the root path
app.get('/', (req, res) => {
  res.send('Welcome to the Hall Booking API');
});

// POST /rooms - Create a new room
app.post('/rooms', (req, res) => {
  const { roomName, seats, amenities, pricePerHour } = req.body;
  
  const newRoom = {
    roomId: rooms.length + 1,
    roomName,
    seats,
    amenities,
    pricePerHour,
  };

  rooms.push(newRoom);
  res.status(201).json(newRoom);
});

// POST /bookings - Book a room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  const isRoomBooked = bookings.some(booking => {
    return booking.roomId === roomId && booking.date === date &&
      (startTime < booking.endTime && endTime > booking.startTime);
  });

  if (isRoomBooked) {
    return res.status(400).json({ error: 'Room is already booked during this time' });
  }

  const newBooking = {
    bookingId: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    status: 'Booked',
    bookingDate: new Date(),
  };

  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// GET /rooms - List all rooms with booking data
app.get('/rooms', (req, res) => {
  const roomsWithBookings = rooms.map(room => {
    const roomBooking = bookings.find(booking => booking.roomId === room.roomId);
    return {
      ...room,
      bookingStatus: roomBooking ? 'Booked' : 'Available',
      customerName: roomBooking ? roomBooking.customerName : null,
      bookingDetails: roomBooking ? { date: roomBooking.date, startTime: roomBooking.startTime, endTime: roomBooking.endTime } : null,
    };
  });
  res.json(roomsWithBookings);
});

// GET /customers - List all customers with booked data
app.get('/customers', (req, res) => {
  const customersWithBookings = bookings.map(booking => {
    const room = rooms.find(r => r.roomId === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room.roomName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  });
  res.json(customersWithBookings);
});

// GET /customer-booking-stats - Get the booking history for a customer
app.get('/customer-booking-stats', (req, res) => {
  const { customerName } = req.query;

  const customerBookings = bookings.filter(booking => booking.customerName === customerName);
  const stats = customerBookings.map(booking => {
    const room = rooms.find(r => r.roomId === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room.roomName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingDate: booking.bookingDate,
      status: booking.status,
    };
  });

  res.json(stats);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:3000`);
});

