const express = require('express');
const router = express.Router();

const {
	createPayment,
	getMyPayments,
	getPayment,
	updatePaymentStatus,
	getPaymentStats,
	createRefund,
	confirmPayment,
} = require('../controllers/payment.controller.js');

const { auth } = require('../middleware/auth.js');

router.post('/', auth(['client', 'admin']), createPayment);
router.post('/confirm', confirmPayment); // No auth needed for webhook confirmation
router.get('/me', auth(['client', 'provider']), getMyPayments);
router.get('/stats', auth(['client', 'provider']), getPaymentStats);
router.get('/:id', auth(), getPayment);
router.patch('/:id/status', auth(['admin', 'provider']), updatePaymentStatus);
router.post('/:id/refund', auth(['admin', 'provider']), createRefund);

module.exports = router;
