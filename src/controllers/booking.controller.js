const Booking = require('../models/Booking.js');
const Provider = require('../models/Provider.js');
const { transporter } = require("../config/nodemailer.js");
const bookingEmailTemplate = require('../templates/bookingTemplate.js');
const Review = require('../models/Review.js');

const createBooking = async (req, res) => {
	try {
		const clientId = req.user.id;

		const {
			providerId,
			serviceCategory,
			eventType,
			location,
			guests,
			dateStart,
			dateEnd,
			eventTime,
			duration,
			budgetMin,
			budgetMax,
			description,
			contactInfo
		} = req.body;

		const provider = await Provider.findById(providerId);
		if (!provider) return res.status(404).json({ message: 'Provider not found' });

		const booking = await Booking.create({
			client: clientId,
			provider: provider._id,
			serviceCategory,
			eventType,
			location,
			guests,
			dateStart,
			dateEnd,
			eventTime,
			duration,
			budgetMin,
			budgetMax,
			description,
			contactInfo,
			paymentStatus: 'unpaid'
		});

		// Populate the booking with provider and client details
		await booking.populate([
			{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone' } },
			{ path: 'client', select: 'firstName lastName email phone' }
		]);

		const mailOptions = {
			from: process.env.EMAIL,
			to: booking.provider.user.email,
			subject: "New Booking Request on Best★rz",
			html: bookingEmailTemplate(booking),
		};

		await transporter.sendMail(mailOptions);

		return res.status(201).json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const listMyBookings = async (req, res) => {
	try {
		const role = req.user.role;
		const { status, page = 1, limit = 20 } = req.query;

		let filter = {};
		if (status) filter.status = status;

		if (role === 'client') {
			filter.client = req.user.id;

			const bookings = await Booking.find(filter)
				.populate([
					{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone profileImage' } },
					{ path: 'client', select: 'firstName lastName email phone profileImage' },
					{ path: 'advancePaymentId', select: 'status amount paymentType processedAt' },
					{ path: 'finalPaymentId', select: 'status amount paymentType processedAt' }
				])
				.sort({ createdAt: -1 })
				.skip((Number(page) - 1) * Number(limit))
				.limit(Number(limit));

			// Fetch all reviews for this client in one query
			const bookingIds = bookings.map(b => b._id);
			const reviews = await Review.find({ booking: { $in: bookingIds }, client: req.user.id });
			const reviewMap = {};
			reviews.forEach(r => {
				reviewMap[r.booking.toString()] = r;
			});

			const bookingsWithReviews = bookings.map(booking => ({
				...booking.toObject(),
				hasReview: !!reviewMap[booking._id.toString()],
				review: reviewMap[booking._id.toString()] || null
			}));

			const total = await Booking.countDocuments(filter);
			return res.json({
				bookings: bookingsWithReviews,
				pagination: {
					page: Number(page),
					limit: Number(limit),
					total,
					pages: Math.ceil(total / Number(limit))
				}
			});
		}

		if (role === 'provider') {
			const provider = await Provider.findOne({ user: req.user.id });
			if (!provider) return res.json({ bookings: [], pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 } });

			filter.provider = provider._id;

			const bookings = await Booking.find(filter)
				.populate([
					{ path: 'client', select: 'firstName lastName email phone profileImage' },
					{ path: 'advancePaymentId', select: 'status amount paymentType processedAt providerEarnings' },
					{ path: 'finalPaymentId', select: 'status amount paymentType processedAt providerEarnings' }
				])
				.sort({ createdAt: -1 })
				.skip((Number(page) - 1) * Number(limit))
				.limit(Number(limit));

			// Fetch all reviews for this provider in one query
			const bookingIds = bookings.map(b => b._id);
			const reviews = await Review.find({ booking: { $in: bookingIds }, provider: provider._id });
			const reviewMap = {};
			reviews.forEach(r => {
				reviewMap[r.booking.toString()] = r;
			});

			const bookingsWithReviews = bookings.map(booking => ({
				...booking.toObject(),
				hasReview: !!reviewMap[booking._id.toString()],
				review: reviewMap[booking._id.toString()] || null
			}));

			const total = await Booking.countDocuments(filter);
			return res.json({
				bookings: bookingsWithReviews,
				pagination: {
					page: Number(page),
					limit: Number(limit),
					total,
					pages: Math.ceil(total / Number(limit))
				}
			});
		}

		return res.status(403).json({ message: 'Forbidden' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const updateBookingStatus = async (req, res) => {
	try {


		console.log(req.user,"UESTSSS")
		const { id } = req.params;
		const { status, notes, amount } = req.body;
		const booking = await Booking.findById(id);
		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Provider can confirm/cancel, Client can complete
		if (req.user.role === 'provider') {
			const provider = await Provider.findOne({ user: req.user.id });
			if (!provider || String(provider._id) !== String(booking.provider)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			
			// Provider can only confirm or cancel
			if (status === 'confirmed') {
				if (!amount || amount <= 0) {
					return res.status(400).json({ message: 'Amount must be set when confirming booking' });
				}
				booking.amount = amount;
				booking.status = 'confirmed';
				booking.paymentStatus = 'unpaid'; // Ready for advance payment
			} else if (status === 'cancelled') {
				booking.status = 'cancelled';
			} else {
				return res.status(400).json({ message: 'Provider can only confirm or cancel bookings' });
			}
		} 
		else if (req.user.role === 'client') {
			// Client can only mark as completed

			console.log(booking.client,"booking.client")
			if (String(booking.client) !== String(req.user.id)) {
				return res.status(403).json({ message: 'Forbidden' });
			}
			
			if (status === 'completed') {
				// Check if booking is confirmed and advance payment is made
				if (booking.status !== 'confirmed') {
					return res.status(400).json({ message: 'Booking must be confirmed first' });
				}
				if (booking.paymentStatus !== 'advance_paid') {
					return res.status(400).json({ message: 'Advance payment must be completed first' });
				}
				booking.status = 'completed';
				// Payment status will be updated when final payment is made
			} else {
				return res.status(400).json({ message: 'Client can only mark bookings as completed' });
			}
		} 
		
		else {
			return res.status(403).json({ message: 'Forbidden' });
		}

		if (notes) booking.notes = notes;

		await booking.save();

		// Populate the updated booking
		await booking.populate([
			{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone profileImage' } },
			{ path: 'client', select: 'firstName lastName email phone profileImage' },
			{ path: 'advancePaymentId', select: 'status amount paymentType processedAt' },
			{ path: 'finalPaymentId', select: 'status amount paymentType processedAt' }
		]);

		return res.json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const getBooking = async (req, res) => {
	try {
		const { id } = req.params;
		const booking = await Booking.findById(id)
			.populate([
				{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone profileImage' } },
				{ path: 'client', select: 'firstName lastName email phone profileImage' },
				{ path: 'advancePaymentId', select: 'status amount paymentType processedAt platformFee providerEarnings' },
				{ path: 'finalPaymentId', select: 'status amount paymentType processedAt platformFee providerEarnings' }
			]);

		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Check if user has access to this booking
		const isClient = String(booking.client._id) === String(req.user.id);
		const provider = await Provider.findOne({ user: req.user.id });
		const isProvider = provider && String(booking.provider._id) === String(provider._id);

		if (!isClient && !isProvider && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		return res.json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const getBookingStats = async (req, res) => {
	try {
		const role = req.user.role;
		let filter = {};

		if (role === 'client') {
			filter.client = req.user.id;
		} else if (role === 'provider') {
			const provider = await Provider.findOne({ user: req.user.id });
			if (!provider) return res.json({ stats: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 } });
			filter.provider = provider._id;
		} else {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const total = await Booking.countDocuments(filter);
		const pending = await Booking.countDocuments({ ...filter, status: 'pending' });
		const confirmed = await Booking.countDocuments({ ...filter, status: 'confirmed' });
		const completed = await Booking.countDocuments({ ...filter, status: 'completed' });
		const cancelled = await Booking.countDocuments({ ...filter, status: 'cancelled' });

		return res.json({
			stats: {
				total,
				pending,
				confirmed,
				completed,
				cancelled
			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const confirmBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const providerId = req.user.id;

		// Find the booking
		const booking = await Booking.findById(bookingId)
			.populate('client', 'firstName lastName email')
			.populate({ path: 'provider', populate: { path: 'user', select: 'firstName lastName email' } });

		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Check if user is the provider for this booking
		const provider = await Provider.findOne({ user: providerId });
		if (!provider || String(booking.provider._id) !== String(provider._id)) {
			return res.status(403).json({ message: 'Only the assigned provider can confirm this booking' });
		}

		// Check if booking is already confirmed
		if (booking.status === 'confirmed') {
			return res.status(400).json({ message: 'Booking is already confirmed' });
		}

		// Update booking status
		booking.status = 'confirmed';
		booking.confirmedAt = new Date();
		booking.confirmedBy = providerId;
		await booking.save();

		// Send email notification to client
		const clientEmailTemplate = `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2 style="color: #333;">Booking Confirmed! 🎉</h2>
				<p>Dear ${booking.client.firstName} ${booking.client.lastName},</p>
				<p>Your booking has been confirmed by ${booking.provider.user.firstName} ${booking.provider.user.lastName}.</p>
				
				<div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
					<h3>Booking Details:</h3>
					<p><strong>Service:</strong> ${booking.serviceCategory}</p>
					<p><strong>Event Type:</strong> ${booking.eventType}</p>
					<p><strong>Date:</strong> ${new Date(booking.dateStart).toLocaleDateString()}</p>
					<p><strong>Time:</strong> ${booking.eventTime}</p>
					<p><strong>Location:</strong> ${booking.location}</p>
					<p><strong>Guests:</strong> ${booking.guests}</p>
					${booking.amount ? `<p><strong>Amount:</strong> $${booking.amount}</p>` : ''}
				</div>
				
				<p>Please proceed with the payment to secure your booking.</p>
				<p>You can make payment through your dashboard.</p>
				
				<p>Best regards,<br>Best★rz Team</p>
			</div>
		`;

		const mailOptions = {
			from: process.env.EMAIL,
			to: booking.client.email,
			subject: "Your Booking Has Been Confirmed - Best★rz",
			html: clientEmailTemplate,
		};

		await transporter.sendMail(mailOptions);

		return res.json({ 
			message: 'Booking confirmed successfully', 
			booking,
			emailSent: true 
		});
	} catch (err) {
		console.error('Confirm booking error:', err);
		return res.status(500).json({ message: err.message });
	}
};

const completeBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const clientId = req.user.id;

		// Find the booking
		const booking = await Booking.findById(bookingId)
			.populate('client', 'firstName lastName email')
			.populate({ path: 'provider', populate: { path: 'user', select: 'firstName lastName email stripeAccountId' } });

		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Check if user is the client for this booking
		if (String(booking.client._id) !== String(clientId)) {
			return res.status(403).json({ message: 'Only the booking client can mark it as completed' });
		}

		// Check if booking is confirmed
		if (booking.status !== 'confirmed') {
			return res.status(400).json({ message: 'Booking must be confirmed before it can be completed' });
		}

		// Check if booking is already completed
		if (booking.status === 'completed') {
			return res.status(400).json({ message: 'Booking is already completed' });
		}

		// Check if payment is completed
		if (booking.paymentStatus !== 'final_paid') {
			return res.status(400).json({ message: 'Payment must be completed before marking booking as done' });
		}

		// Update booking status
		booking.status = 'completed';
		booking.completedAt = new Date();
		booking.completedBy = clientId;

		// Calculate payment split (80% to provider, 20% to admin)
		if (booking.amount) {
			booking.providerAmount = Math.round(booking.amount * 0.8 * 100) / 100; // 80%
			booking.adminAmount = Math.round(booking.amount * 0.2 * 100) / 100;   // 20%
		}

		// Attempt to transfer funds to provider
		let transferResult = null;
		try {
			if (booking.provider.user.stripeAccountId && booking.providerAmount > 0) {
				// Find the final payment to get the payment intent ID
				const finalPayment = await require('../models/Payment.js').findById(booking.finalPaymentId);
				
				if (finalPayment && finalPayment.transactionId) {
					const { transferToConnectedAccount } = require('../services/stripe.service.js');
					
					transferResult = await transferToConnectedAccount(
						booking.provider.user.stripeAccountId,
						booking.providerAmount,
						finalPayment.transactionId, // This is the payment_intent ID
						`Payment for booking ${bookingId} - ${booking.serviceCategory}`
					);
					
					booking.transferStatus = 'transferred';
					
					// Update payment record
					finalPayment.transferredToProvider = true;
					finalPayment.stripeTransferId = transferResult.id;
					finalPayment.transferredAt = new Date();
					await finalPayment.save();
				}
			}
		} catch (transferError) {
			console.error('Transfer error:', transferError);
			booking.transferStatus = 'failed';
			// Don't fail the completion if transfer fails - admin can handle manually
		}

		await booking.save();

		return res.json({ 
			message: 'Booking marked as completed successfully', 
			booking,
			transferResult: transferResult ? 'success' : 'pending'
		});
	} catch (err) {
		console.error('Complete booking error:', err);
		return res.status(500).json({ message: err.message });
	}
};

module.exports = {
	createBooking,
	listMyBookings,
	updateBookingStatus,
	getBooking,
	getBookingStats,
	confirmBooking,
	completeBooking
};