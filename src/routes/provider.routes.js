const express = require('express');
const router = express.Router();

const {
  getProviderDashboard,
  getMyProviderProfile,
  updateProviderProfile,
  getProviderBookings,
  updateBookingStatus,
  getProviderCustomers,
  getProviderEarnings,
  getProviderRateCards,
  createRateCard,
  updateRateCard,
  deleteRateCard,
  getProviderSettings,
  updateProviderSettings,
  getProviderBySlug
} = require('../controllers/provider.controller.js');

const { getBooking } = require('../controllers/booking.controller.js');
// const { getPayment } = require('../controllers/payment.controller.js');
const { auth } = require('../middleware/auth.js');

router.use(auth('provider'));

// Dashboard
router.get('/dashboard', getProviderDashboard);

// Profile Management
router.get('/profile', getMyProviderProfile);
router.put('/profile', updateProviderProfile);

// Booking Management
router.get('/bookings', getProviderBookings);
router.get('/bookings/:id', getBooking);
router.patch('/bookings/:id/status', updateBookingStatus);

// Customer Management
router.get('/customers', getProviderCustomers);

// Earnings
router.get('/earnings', getProviderEarnings);
// router.get('/payments/:id', getPayment);

// Rate Cards
router.get('/rate-cards', getProviderRateCards);
router.post('/rate-cards', createRateCard);
router.put('/rate-cards/:id', updateRateCard);
router.delete('/rate-cards/:id', deleteRateCard);

// Settings
router.get('/settings', getProviderSettings);
router.put('/settings', updateProviderSettings);

// Public provider booking page
router.get('/provider/:slug', getProviderBySlug);

module.exports = router;
