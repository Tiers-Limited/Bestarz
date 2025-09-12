import { Router } from 'express';
import { 
	createPayment, 
	getMyPayments, 
	getPayment, 
	updatePaymentStatus, 
	getPaymentStats,
	createRefund,
	confirmPayment,
	handleStripeWebhook
} from '../controllers/payment.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', auth(['client', 'admin']), createPayment);
router.post('/confirm', confirmPayment); // No auth needed for webhook confirmation
router.post('/webhook', handleStripeWebhook); // Stripe webhook endpoint
router.get('/me', auth(['client', 'provider']), getMyPayments);
router.get('/stats', auth(['client', 'provider']), getPaymentStats);
router.get('/:id', auth(), getPayment);
router.patch('/:id/status', auth(['admin', 'provider']), updatePaymentStatus);
router.post('/:id/refund', auth(['admin', 'provider']), createRefund);

export default router;
