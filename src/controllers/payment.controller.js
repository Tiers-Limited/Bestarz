const Payment = require('../models/Payment.js');
const Booking = require('../models/Booking.js');
const Provider = require('../models/Provider.js');
const User = require('../models/User.js');
const { createPaymentLink, retrieveSession, transferToConnectedAccount } = require('../services/stripe.service.js');

// Create advance payment (30%) - after booking is ACCEPTED
const createAdvancePayment = async (req, res) => {
	try {
		const { bookingId } = req.body;
		const userId = req.user.id;

		const booking = await Booking.findById(bookingId)
			.populate([
				{ path: 'provider', populate: { path: 'user' } },
				{ path: 'client' }
			]);

		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		// Verify booking is ACCEPTED and has total amount set
		if (booking.status !== 'ACCEPTED') {
			return res.status(400).json({ message: 'Booking must be accepted by provider first' });
		}

		if (!booking.totalAmount) {
			return res.status(400).json({ message: 'Booking amount not set by provider' });
		}

		// Check if user is the client
		if (String(booking.client._id) !== String(userId)) {
			return res.status(403).json({ message: 'Only the client can make payments' });
		}

		// Check if advance payment already exists
		if (booking.advancePaymentId) {
			const existingPayment = await Payment.findById(booking.advancePaymentId);
			if (existingPayment && existingPayment.status === 'completed') {
				return res.status(400).json({ message: 'Advance payment already completed' });
			}
			// If payment exists but failed, delete it
			if (existingPayment) {
				await Payment.findByIdAndDelete(existingPayment._id);
			}
		}

		// Calculate payment amounts (30% advance)
		const totalAmount = booking.totalAmount;
		const advanceAmount = booking.advanceAmount; // Already calculated as 30%
		const platformFee = Math.round(advanceAmount * 0.20); // 20% to admin
		const providerEarnings = Math.round(advanceAmount * 0.80); // 80% to provider

		// Create payment record
		const payment = await Payment.create({
			booking: bookingId,
			client: booking.client._id,
			provider: booking.provider._id,
			paymentType: 'advance',
			totalAmount,
			amount: advanceAmount,
			platformFee,
			providerEarnings,
			paymentMethod: 'stripe'
		});

		// Create Stripe payment link
		const { paymentLink, sessionId } = await createPaymentLink(
			booking,
			booking.client.email,
			advanceAmount,
			'advance'
		);

		// Update payment with session ID
		payment.stripePaymentIntentId = sessionId;
		await payment.save();

		// Update booking
		booking.advancePaymentId = payment._id;
		booking.paymentStatus = 'advance_pending';
		await booking.save();

		return res.status(201).json({
			payment,
			paymentLink,
			sessionId,
			message: 'Advance payment (30%) initiated successfully'
		});
	} catch (err) {
		console.error('Create advance payment error:', err);
		return res.status(500).json({ message: err.message });
	}
};

// Create final payment (70%) - after client marks booking as "Done"
const createFinalPayment = async (req, res) => {
	try {
		const { bookingId } = req.body;
		const userId = req.user.id;

		const booking = await Booking.findById(bookingId)
			.populate([
				{ path: 'provider', populate: { path: 'user' } },
				{ path: 'client' }
			]);

		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		// Verify booking has final payment pending (client marked as done)
		if (booking.paymentStatus !== 'final_pending') {
			return res.status(400).json({ message: 'Event must be marked as done first' });
		}

		// Check if user is the client
		if (String(booking.client._id) !== String(userId)) {
			return res.status(403).json({ message: 'Only the client can make payments' });
		}

		// Check if advance payment was made
		if (!booking.advancePaid) {
			return res.status(400).json({ message: 'Advance payment must be completed first' });
		}

		// Check if final payment already exists
		if (booking.finalPaymentId) {
			const existingPayment = await Payment.findById(booking.finalPaymentId);
			if (existingPayment && existingPayment.status === 'completed') {
				return res.status(400).json({ message: 'Final payment already completed' });
			}
			// If payment exists but failed, delete it
			if (existingPayment) {
				await Payment.findByIdAndDelete(existingPayment._id);
			}
		}

		// Calculate payment amounts (70% final payment)
		const totalAmount = booking.totalAmount;
		const finalAmount = booking.remainingAmount; // Already calculated as 70%
		const platformFee = Math.round(finalAmount * 0.20); // 20% to admin
		const providerEarnings = Math.round(finalAmount * 0.80); // 80% to provider

		// Create payment record
		const payment = await Payment.create({
			booking: bookingId,
			client: booking.client._id,
			provider: booking.provider._id,
			paymentType: 'final',
			totalAmount,
			amount: finalAmount,
			platformFee,
			providerEarnings,
			paymentMethod: 'stripe'
		});

		// Create Stripe payment link
		const { paymentLink, sessionId } = await createPaymentLink(
			booking,
			booking.client.email,
			finalAmount,
			'final'
		);

		// Update payment with session ID
		payment.stripePaymentIntentId = sessionId;
		await payment.save();

		// Update booking
		booking.finalPaymentId = payment._id;
		booking.paymentStatus = 'final_pending';
		await booking.save();

		return res.status(201).json({
			payment,
			paymentLink,
			sessionId,
			message: 'Final payment (70%) initiated successfully'
		});
	} catch (err) {
		console.error('Create final payment error:', err);
		return res.status(500).json({ message: err.message });
	}
};

// Manual payment completion for testing (bypasses webhook)
const manualCompletePayment = async (req, res) => {
	try {
		const { paymentId } = req.params;
		
		console.log('🔧 Manual payment completion requested for:', paymentId);
		
		const payment = await Payment.findById(paymentId);
		
		if (!payment) {
			return res.status(404).json({ message: 'Payment not found' });
		}
		
		if (payment.status === 'completed') {
			return res.json({
				success: true,
				payment,
				message: 'Payment already completed'
			});
		}
		
		// Update payment status
		payment.status = 'completed';
		payment.processedAt = new Date();
		await payment.save();
		
		console.log('✅ Payment marked as completed:', payment._id);
		
		// Update booking payment status
		const booking = await Booking.findById(payment.booking);
		if (booking) {
			if (payment.paymentType === 'advance') {
				booking.paymentStatus = 'advance_paid';
				booking.advancePaid = true;
				booking.status = 'IN_PROGRESS';
				console.log(`✅ Booking status updated to IN_PROGRESS for advance payment`);
			} else if (payment.paymentType === 'final') {
				booking.paymentStatus = 'final_paid';
				booking.finalPaid = true;
				booking.status = 'COMPLETED';
				booking.completedAt = new Date();
				console.log(`✅ Booking status updated to COMPLETED for final payment`);
			}
			await booking.save();
		}
		
		return res.json({
			success: true,
			payment,
			booking,
			message: 'Payment completed successfully'
		});
	} catch (err) {
		console.error('Manual complete payment error:', err);
		return res.status(500).json({ message: err.message });
	}
};

// Confirm payment (called by webhook or frontend after successful payment)
const confirmPayment = async (req, res) => {
	try {
		const { sessionId } = req.body;

		const session = await retrieveSession(sessionId);

		if (session.payment_status === 'paid') {
			// Find payment by session ID
			const payment = await Payment.findOne({ stripePaymentIntentId: sessionId })
				.populate([
					{ path: 'booking' },
					{ path: 'provider', populate: { path: 'user' } }
				]);

			if (!payment) {
				return res.status(404).json({ message: 'Payment not found' });
			}

			if (payment.status === 'completed') {
				return res.json({
					success: true,
					payment,
					message: 'Payment already confirmed'
				});
			}

			// Update payment status
			payment.status = 'completed';
			payment.transactionId = session.payment_intent;
			payment.processedAt = new Date();
			await payment.save();

			// Update booking payment status
			const booking = await Booking.findById(payment.booking._id);
			if (booking) {
				if (payment.paymentType === 'advance') {
					booking.paymentStatus = 'advance_paid';
				} else if (payment.paymentType === 'final') {
					booking.paymentStatus = 'final_paid';
				}
				await booking.save();
			}

			// Transfer funds to provider (80%)
			try {
				const providerUser = payment.provider.user;
				if (providerUser.stripeAccountId) {
					const transfer = await transferToConnectedAccount(
						providerUser.stripeAccountId,
						payment.providerEarnings,
						payment.transactionId,
						`${payment.paymentType} payment for booking ${payment.booking._id}`
					);

					payment.transferredToProvider = true;
					payment.stripeTransferId = transfer.id;
					payment.transferredAt = new Date();
					await payment.save();
				}
			} catch (transferError) {
				console.error('Transfer error:', transferError);
				// Don't fail the payment confirmation if transfer fails
				// Admin can manually handle transfers
			}

			return res.json({
				success: true,
				payment,
				message: 'Payment confirmed successfully'
			});
		}

		return res.status(400).json({
			success: false,
			message: 'Payment not completed'
		});
	} catch (err) {
		console.error('Confirm payment error:', err);
		return res.status(500).json({ message: err.message });
	}
};

// Get payment details
const getPayment = async (req, res) => {
	try {
		const { id } = req.params;
		const payment = await Payment.findById(id)
			.populate([
				{ path: 'booking', select: 'serviceCategory eventType dateStart location description amount status' },
				{ path: 'client', select: 'firstName lastName email phone' },
				{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone' } }
			]);

		if (!payment) {
			return res.status(404).json({ message: 'Payment not found' });
		}

		// Check access
		const isClient = String(payment.client._id) === String(req.user.id);
		const isProvider = req.user.role === 'provider' && String(payment.provider.user._id) === String(req.user.id);

		if (!isClient && !isProvider && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		return res.json({ payment });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get all payments for a booking
const getBookingPayments = async (req, res) => {
	try {
		const { bookingId } = req.params;

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		// Check access
		const isClient = String(booking.client) === String(req.user.id);
		const provider = await Provider.findOne({ user: req.user.id });
		const isProvider = provider && String(booking.provider) === String(provider._id);

		if (!isClient && !isProvider && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const payments = await Payment.find({ booking: bookingId })
			.populate([
				{ path: 'client', select: 'firstName lastName email' },
				{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email' } }
			])
			.sort({ createdAt: 1 });

		return res.json({ payments });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get my payments (client or provider)
const getMyPayments = async (req, res) => {
	try {
		const userId = req.user.id;
		const { status, paymentType, page = 1, limit = 20 } = req.query;

		let filter = {};
		if (req.user.role === 'client') {
			filter.client = userId;
		} else if (req.user.role === 'provider') {
			const provider = await Provider.findOne({ user: userId });
			if (!provider) {
				return res.json({
					payments: [],
					pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 }
				});
			}
			filter.provider = provider._id;
		} else {
			return res.status(403).json({ message: 'Forbidden' });
		}

		if (status) filter.status = status;
		if (paymentType) filter.paymentType = paymentType;

		const payments = await Payment.find(filter)
			.populate([
				{ path: 'booking', select: 'serviceCategory eventType dateStart location amount' },
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

// Get payment statistics
const getPaymentStats = async (req, res) => {
	try {
		const userId = req.user.id;
		let filter = {};

		if (req.user.role === 'client') {
			filter.client = userId;
		} else if (req.user.role === 'provider') {
			const provider = await Provider.findOne({ user: userId });
			if (!provider) {
				return res.json({
					stats: {
						total: 0,
						completed: 0,
						pending: 0,
						totalEarnings: 0,
						advancePayments: 0,
						finalPayments: 0
					}
				});
			}
			filter.provider = provider._id;
		} else {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const total = await Payment.countDocuments(filter);
		const completed = await Payment.countDocuments({ ...filter, status: 'completed' });
		const pending = await Payment.countDocuments({ ...filter, status: 'pending' });
		const advancePayments = await Payment.countDocuments({ ...filter, paymentType: 'advance', status: 'completed' });
		const finalPayments = await Payment.countDocuments({ ...filter, paymentType: 'final', status: 'completed' });

		// Calculate earnings based on role
		let totalEarnings = 0;
		let thisMonthEarnings = 0;

		const completedPayments = await Payment.find({ ...filter, status: 'completed' });

		if (req.user.role === 'provider') {
			totalEarnings = completedPayments.reduce((sum, payment) => sum + payment.providerEarnings, 0);
		} else if (req.user.role === 'client') {
			totalEarnings = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
		}

		// This month's earnings
		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);

		const thisMonthPayments = completedPayments.filter(payment =>
			payment.processedAt && payment.processedAt >= thisMonth
		);

		if (req.user.role === 'provider') {
			thisMonthEarnings = thisMonthPayments.reduce((sum, payment) => sum + payment.providerEarnings, 0);
		} else if (req.user.role === 'client') {
			thisMonthEarnings = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);
		}

		return res.json({
			stats: {
				total,
				completed,
				pending,
				advancePayments,
				finalPayments,
				totalEarnings,
				thisMonthEarnings
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Verify payment session (optional frontend verification)
const verifyPaymentSession = async (req, res) => {
	try {
		const { sessionId } = req.body;
		
		if (!sessionId) {
			return res.status(400).json({ message: 'Session ID required' });
		}

		// Retrieve session from Stripe
		const session = await retrieveSession(sessionId);
		
		if (!session) {
			return res.status(404).json({ message: 'Session not found' });
		}

		// Check if payment was successful
		const isSuccessful = session.payment_status === 'paid';
		
		// If payment is successful but database not updated, manually trigger webhook processing
		if (isSuccessful && session.metadata) {
			console.log('🔄 Payment successful, checking if database needs updating...');
			
			const { bookingId, paymentType } = session.metadata;
			if (bookingId && paymentType) {
				// Check if payment is still pending in database
				const payment = await Payment.findOne({
					booking: bookingId,
					paymentType: paymentType,
					status: 'pending'
				});
				
				if (payment) {
					console.log('⚠️ Payment successful but database not updated. Manually processing...');
					
					// Manually trigger the webhook handler logic
					try {
						// Import the webhook handler
						const { handleStripeWebhook } = require('./webhook.controller.js');
						
						// Create a mock webhook event
						const mockEvent = {
							type: 'checkout.session.completed',
							id: `evt_mock_${Date.now()}`,
							data: {
								object: session
							}
						};
						
						// Process the mock event (this will update the database)
						console.log('🔧 Manually processing webhook event...');
						// We can't call the full webhook handler due to signature verification
						// So we'll update the payment directly here
						
						payment.status = 'completed';
						payment.stripePaymentIntentId = session.id;
						payment.transactionId = session.payment_intent;
						payment.processedAt = new Date();
						await payment.save();
						
						// Update booking
						const booking = await Booking.findById(bookingId);
						if (booking) {
							if (paymentType === 'advance') {
								booking.paymentStatus = 'advance_paid';
								booking.advancePaid = true;
								booking.status = 'IN_PROGRESS';
							} else if (paymentType === 'final') {
								booking.paymentStatus = 'final_paid';
								booking.finalPaid = true;
								booking.status = 'COMPLETED';
								booking.completedAt = new Date();
							}
							await booking.save();
						}
						
						console.log('✅ Payment and booking updated successfully');
						
					} catch (updateError) {
						console.error('❌ Failed to update payment:', updateError);
					}
				}
			}
		}
		
		return res.json({
			success: true,
			sessionId: session.id,
			paymentStatus: session.payment_status,
			isSuccessful,
			metadata: session.metadata,
			message: isSuccessful ? 'Payment verified successfully' : 'Payment not completed'
		});
		
	} catch (err) {
		console.error('Verify payment session error:', err);
		return res.status(500).json({ message: err.message });
	}
};

module.exports = {
	createAdvancePayment,
	createFinalPayment,
	confirmPayment,
	manualCompletePayment,
	verifyPaymentSession,
	getPayment,
	getBookingPayments,
	getMyPayments,
	getPaymentStats
};