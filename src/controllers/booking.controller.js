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

module.exports = {
	createBooking,
	listMyBookings,
	updateBookingStatus,
	getBooking,
	getBookingStats
};