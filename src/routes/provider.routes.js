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

// --- Protected routes ---
router.get('/dashboard', auth('provider'), getProviderDashboard);

// Profile Management
router.get('/profile', auth('provider'), getMyProviderProfile);
router.put('/profile', auth('provider'), updateProviderProfile);

// Booking Management
router.get('/bookings', auth('provider'), getProviderBookings);
router.get('/bookings/:id', auth('provider'), getBooking);
router.patch('/bookings/:id/status', auth('provider'), updateBookingStatus);

// Customer Management
router.get('/customers', auth('provider'), getProviderCustomers);

// Earnings
router.get('/earnings', auth('provider'), getProviderEarnings);
// router.get('/payments/:id', auth('provider'), getPayment);

// Rate Cards
router.get('/rate-cards', auth('provider'), getProviderRateCards);
router.post('/rate-cards', auth('provider'), createRateCard);
router.put('/rate-cards/:id', auth('provider'), updateRateCard);
router.delete('/rate-cards/:id', auth('provider'), deleteRateCard);

// Settings
router.get('/settings', auth('provider'), getProviderSettings);
router.put('/settings', auth('provider'), updateProviderSettings);

// --- Public route ---
router.get('/provider/:slug', getProviderBySlug);

module.exports = router;
