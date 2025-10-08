const Booking = require('../models/Booking.js');
const Provider = require('../models/Provider.js');
const Review = require('../models/Review.js');
const { transporter } = require("../config/nodemailer.js");
const bookingEmailTemplate = require('../templates/bookingTemplate.js');

// 1. Client submits a booking request (PENDING status)
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

		// Create booking with PENDING status
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
			status: 'PENDING', // Initial status
			paymentStatus: 'unpaid'
		});

		// Populate the booking with provider and client details
		await booking.populate([
			{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone' } },
			{ path: 'client', select: 'firstName lastName email phone' }
		]);

		// Send notification email to provider
		const mailOptions = {
			from: process.env.EMAIL,
			to: booking.provider.user.email,
			subject: "New Booking Request on Best★rz",
			html: bookingEmailTemplate(booking),
		};

		await transporter.sendMail(mailOptions);

		return res.status(201).json({ 
			message: 'Booking request submitted successfully',
			booking 
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// 2. Provider accepts or rejects booking request
const updateBookingStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, totalAmount } = req.body; // ACCEPTED or REJECTED
		const providerId = req.user.id;

		const booking = await Booking.findById(id)
			.populate('client', 'firstName lastName email')
			.populate({ path: 'provider', populate: { path: 'user', select: 'firstName lastName email' } });

		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Verify provider ownership
		const provider = await Provider.findOne({ user: providerId });

		if (!provider || String(booking.provider._id) !== String(provider._id)) {
			return res.status(403).json({ message: 'Only the assigned provider can update this booking' });
		}

		// Only allow status change from PENDING
		if (booking.status !== 'PENDING') {
			return res.status(400).json({ message: 'Booking request can only be updated from PENDING status' });
		}

		// Update booking status
		if (status === 'ACCEPTED') {
			if (!totalAmount || totalAmount <= 0) {
				return res.status(400).json({ message: 'Total amount must be provided when accepting booking' });
			}

			booking.status = 'ACCEPTED';
			booking.totalAmount = totalAmount;
			booking.advanceAmount = Math.round(totalAmount * 0.3 * 100) / 100; // 30%
			booking.remainingAmount = Math.round(totalAmount * 0.7 * 100) / 100; // 70%
			booking.confirmedAt = new Date();
			booking.confirmedBy = providerId;
			booking.paymentStatus = 'advance_pending';

			// Send acceptance email to client
			const clientEmailTemplate = `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Booking Request Accepted! 🎉</h2>
					<p>Dear ${booking.client.firstName} ${booking.client.lastName},</p>
					<p>Great news! Your booking request has been accepted by ${booking.provider.user.firstName} ${booking.provider.user.lastName}.</p>
					
					<div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
						<h3>Payment Information:</h3>
						<p><strong>Total Amount:</strong> $${booking.totalAmount}</p>
						<p><strong>Advance Payment (30%):</strong> $${booking.advanceAmount}</p>
						<p><strong>Remaining Payment (70%):</strong> $${booking.remainingAmount}</p>
					</div>
					
					<p>Please make the advance payment to confirm your booking.</p>
					<p>You can make payment through your dashboard.</p>
					
					<p>Best regards,<br>Best★rz Team</p>
				</div>
			`;

			const mailOptions = {
				from: process.env.EMAIL,
				to: booking.client.email,
				subject: "Your Booking Request Has Been Accepted - Best★rz",
				html: clientEmailTemplate,
			};

			await transporter.sendMail(mailOptions);

		} else if (status === 'REJECTED') {
			booking.status = 'REJECTED';

			// Send rejection email to client
			const rejectionEmailTemplate = `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Booking Request Update</h2>
					<p>Dear ${booking.client.firstName} ${booking.client.lastName},</p>
					<p>We regret to inform you that your booking request has been declined by the provider.</p>
					<p>You can browse other providers or try booking for different dates.</p>
					<p>Best regards,<br>Best★rz Team</p>
				</div>
			`;

			const mailOptions = {
				from: process.env.EMAIL,
				to: booking.client.email,
				subject: "Booking Request Update - Best★rz",
				html: rejectionEmailTemplate,
			};

			await transporter.sendMail(mailOptions);
		} else {
			return res.status(400).json({ message: 'Invalid status. Must be ACCEPTED or REJECTED' });
		}

		await booking.save();

		return res.json({ 
			message: `Booking ${status.toLowerCase()} successfully`, 
			booking 
		});
	} catch (err) {
		console.error('Update booking status error:', err);
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

// 4. Client marks booking as "Done" after event completion (triggers final payment)
const markBookingDone = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const clientId = req.user.id;

		// Find the booking
		const booking = await Booking.findById(bookingId)
			.populate('client', 'firstName lastName email')
			.populate({ path: 'provider', populate: { path: 'user', select: 'firstName lastName email' } });

		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Check if user is the client for this booking
		if (String(booking.client._id) !== String(clientId)) {
			return res.status(403).json({ message: 'Only the booking client can mark it as done' });
		}

		// Check if booking is in IN_PROGRESS status (advance payment made)
		if (booking.status !== 'IN_PROGRESS') {
			return res.status(400).json({ message: 'Booking must be in progress (advance payment completed) to mark as done' });
		}

		// Check if advance payment was made
		if (!booking.advancePaid) {
			return res.status(400).json({ message: 'Advance payment must be completed before marking as done' });
		}

		// Update status to trigger final payment
		booking.paymentStatus = 'final_pending';
		await booking.save();

		return res.json({ 
			message: 'Event marked as done. Please proceed with final payment to complete the booking.',
			booking,
			finalPaymentAmount: booking.remainingAmount
		});
	} catch (err) {
		console.error('Mark booking done error:', err);
		return res.status(500).json({ message: err.message });
	}
};

// 5. Complete booking after final payment is made
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
			return res.status(403).json({ message: 'Only the booking client can complete the booking' });
		}

		// Check if final payment is completed
		if (!booking.finalPaid || booking.paymentStatus !== 'final_paid') {
			return res.status(400).json({ message: 'Final payment must be completed before completing booking' });
		}

		// Check if booking is already completed
		if (booking.status === 'COMPLETED') {
			return res.status(400).json({ message: 'Booking is already completed' });
		}

		// Update booking status to COMPLETED
		booking.status = 'COMPLETED';
		booking.completedAt = new Date();
		booking.completedBy = clientId;

		// Calculate payment split (80% to provider, 20% to admin) based on total amount
		if (booking.totalAmount) {
			booking.providerAmount = Math.round(booking.totalAmount * 0.8 * 100) / 100; // 80%
			booking.adminAmount = Math.round(booking.totalAmount * 0.2 * 100) / 100;   // 20%
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

// Anonymous booking creation for public provider pages
const createAnonymousBooking = async (req, res) => {
	try {
		console.log('📝 Anonymous booking request received:', req.body);
		
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

		console.log('🔍 Looking for provider:', providerId);
		const provider = await Provider.findById(providerId);
		if (!provider) {
			console.log('❌ Provider not found:', providerId);
			return res.status(404).json({ message: 'Provider not found' });
		}
		console.log('✅ Provider found:', provider._id);

		// Create booking with PENDING status (no client ID for anonymous)
		console.log('📝 Creating anonymous booking...');
		const booking = await Booking.create({
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
			status: 'PENDING', // Initial status
			paymentStatus: 'unpaid',
			isAnonymous: true // Flag to indicate anonymous booking
		});
		console.log('✅ Booking created:', booking._id);

		// Populate the booking with provider details
		console.log('🔄 Populating booking with provider details...');
		await booking.populate([
			{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone' } }
		]);

		// Send notification email to provider (skip if email not configured)
		try {
			if (process.env.EMAIL && transporter && booking.provider.user?.email) {
				console.log('📧 Sending email notification...');
				const mailOptions = {
					from: process.env.EMAIL,
					to: booking.provider.user.email,
					subject: "New Anonymous Booking Request on Best★rz",
					html: bookingEmailTemplate(booking),
				};
				await transporter.sendMail(mailOptions);
				console.log('✅ Email sent successfully');
			} else {
				console.log('⚠️ Email sending skipped (not configured or missing recipient)');
			}
		} catch (emailError) {
			console.log('⚠️ Email sending failed, but continuing:', emailError.message);
		}

		console.log('✅ Anonymous booking completed successfully');
		return res.status(201).json({ 
			message: 'Booking request submitted successfully',
			booking 
		});
	} catch (err) {
		console.error('❌ Anonymous booking error:', err);
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
	markBookingDone,
	completeBooking,
	createAnonymousBooking
};