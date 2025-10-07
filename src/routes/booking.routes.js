const express = require('express');
const router = express.Router();

const {
  createBooking,
  listMyBookings,
  updateBookingStatus,
  getBooking,
  getBookingStats,
  confirmBooking,
  markBookingDone,
  completeBooking,
  createAnonymousBooking
} = require('../controllers/booking.controller.js');

const { auth } = require('../middleware/auth.js');

// Debug middleware for booking routes
router.use((req, res, next) => {
  console.log(`📍 Booking Route: ${req.method} ${req.path}`);
  next();
});

router.post('/', auth('client'), createBooking);
router.post('/anonymous', createAnonymousBooking); // Public route for anonymous bookings
router.get('/me', auth(['client', 'provider']), listMyBookings);
router.get('/stats', auth(['client', 'provider']), getBookingStats);
router.get('/:id', auth(), getBooking);
router.patch('/:id/status',auth(['client', 'provider']), updateBookingStatus);
router.patch('/:bookingId/confirm', auth('provider'), confirmBooking);
router.patch('/:bookingId/done', auth('client'), markBookingDone);
router.patch('/:bookingId/complete', auth('client'), completeBooking);

module.exports = router;
