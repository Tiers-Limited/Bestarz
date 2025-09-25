const express = require('express');
const router = express.Router();

const {
  createBooking,
  listMyBookings,
  updateBookingStatus,
  getBooking,
  getBookingStats
} = require('../controllers/booking.controller.js');

const { auth } = require('../middleware/auth.js');

router.post('/', auth('client'), createBooking);
router.get('/me', auth(['client', 'provider']), listMyBookings);
router.get('/stats', auth(['client', 'provider']), getBookingStats);
router.get('/:id', auth(), getBooking);
router.patch('/:id/status', auth(), updateBookingStatus);

module.exports = router;
