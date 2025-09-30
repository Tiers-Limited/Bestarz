const express = require('express');
const router = express.Router();

const {
	createAdvancePayment,
	createFinalPayment,
	confirmPayment,
	getPayment,
	getBookingPayments,
	getMyPayments,
	getPaymentStats,
} = require('../controllers/payment.controller.js');

const { auth } = require('../middleware/auth.js');

// Create advance payment (30%)
router.post('/advance', auth('client'), createAdvancePayment);

// Create final payment (70%)
router.post('/final', auth('client'), createFinalPayment);

// Confirm payment (webhook or frontend callback)
router.post('/confirm', confirmPayment);

// Get my payments
router.get('/me', auth(['client', 'provider']), getMyPayments);

// Get payment statistics
router.get('/stats', auth(['client', 'provider']), getPaymentStats);

// Get payments for a specific booking
router.get('/booking/:bookingId', auth(), getBookingPayments);

// Get specific payment details
router.get('/:id', auth(), getPayment);

module.exports = router;