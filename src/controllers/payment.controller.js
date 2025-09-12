import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import User from '../models/User.js';
import { createPaymentLink, retrieveSession, createStripeRefund } from '../services/stripe.service.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res) => {
	try {
		const { bookingId, amount, paymentMethod = 'stripe' } = req.body;
		const userId = req.user.id;
		
		const booking = await Booking.findById(bookingId)
			.populate('provider client');
		if (!booking) return res.status(404).json({ message: 'Booking not found' });
		
		// Check if user has access to this booking
		const isClient = String(booking.client._id) === String(userId);
		if (!isClient && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		// Check if payment already exists
		const existingPayment = await Payment.findOne({ booking: bookingId });
		if (existingPayment) {
			return res.status(400).json({ message: 'Payment already exists for this booking' });
		}
		
		// Create payment record
		const payment = await Payment.create({
			booking: bookingId,
			client: booking.client._id,
			provider: booking.provider._id,
			amount,
			paymentMethod
		});
		
		// Create Stripe payment link
		const { paymentLink, sessionId } = await createPaymentLink(booking, booking.client.email);
		
		// Update payment with session ID
		payment.stripePaymentIntentId = sessionId;
		await payment.save();
		
		// Update booking payment status
		booking.paymentStatus = 'pending';
		await booking.save();
		
		return res.status(201).json({ 
			payment,
			paymentLink,
			sessionId
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const getMyPayments = async (req, res) => {
	try {
		const userId = req.user.id;
		const { status, page = 1, limit = 20 } = req.query;
		
		let filter = {};
		if (req.user.role === 'client') {
			filter.client = userId;
		} else if (req.user.role === 'provider') {
			const provider = await Provider.findOne({ user: userId });
			if (!provider) return res.json({ payments: [], pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 } });
			filter.provider = provider._id;
		} else {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		if (status) filter.status = status;
		
		const payments = await Payment.find(filter)
			.populate([
				{ path: 'booking', select: 'serviceCategory eventType dateStart location' },
				{ path: 'client', select: 'firstName lastName email' },
				{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email' } }
			])
			.sort({ createdAt: -1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));
		
		const total = await Payment.countDocuments(filter);
		
		return res.json({
			payments,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				pages: Math.ceil(total / Number(limit))
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const getPayment = async (req, res) => {
	try {
		const { id } = req.params;
		const payment = await Payment.findById(id)
			.populate([
				{ path: 'booking', select: 'serviceCategory eventType dateStart location description' },
				{ path: 'client', select: 'firstName lastName email phone' },
				{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone' } }
			]);
		
		if (!payment) return res.status(404).json({ message: 'Payment not found' });
		
		// Check access
		const isClient = String(payment.client._id) === String(req.user.id);
		const isProvider = req.user.role === 'provider' && String(payment.provider._id) === String(req.user.id);
		
		if (!isClient && !isProvider && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		return res.json({ payment });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const updatePaymentStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, transactionId, stripePaymentIntentId } = req.body;
		
		const payment = await Payment.findById(id);
		if (!payment) return res.status(404).json({ message: 'Payment not found' });
		
		// Only admin or provider can update payment status
		if (req.user.role !== 'admin' && req.user.role !== 'provider') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		payment.status = status;
		if (transactionId) payment.transactionId = transactionId;
		if (stripePaymentIntentId) payment.stripePaymentIntentId = stripePaymentIntentId;
		
		if (status === 'completed') {
			payment.processedAt = new Date();
		}
		
		await payment.save();
		
		// Update booking payment status
		const booking = await Booking.findById(payment.booking);
		if (booking) {
			booking.paymentStatus = status;
			await booking.save();
		}
		
		return res.json({ payment });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const getPaymentStats = async (req, res) => {
	try {
		const userId = req.user.id;
		let filter = {};
		
		if (req.user.role === 'client') {
			filter.client = userId;
		} else if (req.user.role === 'provider') {
			const provider = await Provider.findOne({ user: userId });
			if (!provider) return res.json({ stats: { total: 0, completed: 0, pending: 0, failed: 0, totalAmount: 0 } });
			filter.provider = provider._id;
		} else {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		const total = await Payment.countDocuments(filter);
		const completed = await Payment.countDocuments({ ...filter, status: 'completed' });
		const pending = await Payment.countDocuments({ ...filter, status: 'pending' });
		const failed = await Payment.countDocuments({ ...filter, status: 'failed' });
		
		const completedPayments = await Payment.find({ ...filter, status: 'completed' });
		const totalAmount = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
		
		// This month's earnings
		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);
		
		const thisMonthPayments = completedPayments.filter(payment => 
			payment.processedAt && payment.processedAt >= thisMonth
		);
		const thisMonthAmount = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
		
		return res.json({
			stats: {
				total,
				completed,
				pending,
				failed,
				totalAmount,
				thisMonthAmount
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const createRefund = async (req, res) => {
	try {
		const { id } = req.params;
		const { amount, reason } = req.body;
		
		const payment = await Payment.findById(id);
		if (!payment) return res.status(404).json({ message: 'Payment not found' });
		
		if (payment.status !== 'completed') {
			return res.status(400).json({ message: 'Can only refund completed payments' });
		}
		
		// Only admin or provider can create refunds
		if (req.user.role !== 'admin' && req.user.role !== 'provider') {
			return res.status(403).json({ message: 'Forbidden' });
		}
		
		const refundAmount = amount || payment.amount;
		
		// Create Stripe refund
		const stripeRefund = await createStripeRefund(payment.stripePaymentIntentId, refundAmount);
		
		payment.status = 'refunded';
		payment.refundAmount = refundAmount;
		payment.refundReason = reason;
		payment.refundId = stripeRefund.id;
		payment.refundedAt = new Date();
		
		await payment.save();
		
		// Update booking payment status
		const booking = await Booking.findById(payment.booking);
		if (booking) {
			booking.paymentStatus = 'refunded';
			await booking.save();
		}
		
		return res.json({ payment });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const confirmPayment = async (req, res) => {
	try {
		const { sessionId } = req.body;
		
		const session = await retrieveSession(sessionId);
		
		if (session.payment_status === 'paid') {
			// Find payment by session ID
			const payment = await Payment.findOne({ stripePaymentIntentId: sessionId });
			if (payment) {
				payment.status = 'completed';
				payment.transactionId = session.payment_intent;
				payment.processedAt = new Date();
				await payment.save();
				
				// Update booking payment status
				const booking = await Booking.findById(payment.booking);
				if (booking) {
					booking.paymentStatus = 'paid';
					await booking.save();
				}
				
				return res.json({ 
					success: true, 
					payment,
					message: 'Payment confirmed successfully' 
				});
			}
		}
		
		return res.status(400).json({ 
			success: false, 
			message: 'Payment not found or not completed' 
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const handleStripeWebhook = async (req, res) => {
	try {
		const sig = req.headers['stripe-signature'];
		const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
		
		let event;
		
		try {
			event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
		} catch (err) {
			console.error('Webhook signature verification failed:', err.message);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}
		
		// Handle the event
		switch (event.type) {
			case 'checkout.session.completed':
				const session = event.data.object;
				await handleCheckoutSessionCompleted(session);
				break;
			case 'payment_intent.succeeded':
				const paymentIntent = event.data.object;
				await handlePaymentIntentSucceeded(paymentIntent);
				break;
			default:
				console.log(`Unhandled event type ${event.type}`);
		}
		
		res.json({ received: true });
	} catch (err) {
		console.error('Webhook error:', err);
		return res.status(500).json({ message: err.message });
	}
};

async function handleCheckoutSessionCompleted(session) {
	try {
		const payment = await Payment.findOne({ stripePaymentIntentId: session.id });
		if (payment) {
			payment.status = 'completed';
			payment.transactionId = session.payment_intent;
			payment.processedAt = new Date();
			await payment.save();
			
			// Update booking payment status
			const booking = await Booking.findById(payment.booking);
			if (booking) {
				booking.paymentStatus = 'paid';
				await booking.save();
			}
		}
	} catch (err) {
		console.error('Error handling checkout session completed:', err);
	}
}

async function handlePaymentIntentSucceeded(paymentIntent) {
	try {
		const payment = await Payment.findOne({ transactionId: paymentIntent.id });
		if (payment && payment.status !== 'completed') {
			payment.status = 'completed';
			payment.processedAt = new Date();
			await payment.save();
			
			// Update booking payment status
			const booking = await Booking.findById(payment.booking);
			if (booking) {
				booking.paymentStatus = 'paid';
				await booking.save();
			}
		}
	} catch (err) {
		console.error('Error handling payment intent succeeded:', err);
	}
}
