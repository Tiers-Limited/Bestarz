import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';
import { transporter } from "../config/nodemailer.js";
import { bookingEmailTemplate } from '../templates/bookingTemplate.js';

export const createBooking = async (req, res) => {
	try {
		const clientId = req.user.id;

		console.log(clientId,"clientId")
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
			contactInfo
		});

		// Populate the booking with provider and client details
		await booking.populate([
			{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone' } },
			{ path: 'client', select: 'firstName lastName email phone' }
		]);


		console.log(booking,"booking")

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

export const listMyBookings = async (req, res) => {
	try {
		const role = req.user.role;
		const { status, page = 1, limit = 20 } = req.query;

		let filter = {};
		if (status) filter.status = status;

		if (role === 'client') {
			filter.client = req.user.id;
			const bookings = await Booking.find(filter)
				.populate([
					{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone profileImage' } }
				])
				.sort({ createdAt: -1 })
				.skip((Number(page) - 1) * Number(limit))
				.limit(Number(limit));

			const total = await Booking.countDocuments(filter);
			return res.json({
				bookings,
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
					{ path: 'client', select: 'firstName lastName email phone profileImage' }
				])
				.sort({ createdAt: -1 })
				.skip((Number(page) - 1) * Number(limit))
				.limit(Number(limit));

			const total = await Booking.countDocuments(filter);
			return res.json({
				bookings,
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

export const updateBookingStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, notes, amount } = req.body;
		const booking = await Booking.findById(id);
		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Only the provider owning the booking can update status
		if (req.user.role !== 'provider') return res.status(403).json({ message: 'Forbidden' });
		const provider = await Provider.findOne({ user: req.user.id });
		if (!provider || String(provider._id) !== String(booking.provider)) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		booking.status = status;
		if (notes) booking.notes = notes;
		if (amount) booking.amount = amount;

		await booking.save();

		// Populate the updated booking
		await booking.populate([
			{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone profileImage' } },
			{ path: 'client', select: 'firstName lastName email phone profileImage' }
		]);

		return res.json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const getBooking = async (req, res) => {
	try {
		const { id } = req.params;
		const booking = await Booking.findById(id)
			.populate([
				{ path: 'provider', populate: { path: 'user', select: 'firstName lastName email phone profileImage' } },
				{ path: 'client', select: 'firstName lastName email phone profileImage' }
			]);

		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Check if user has access to this booking
		const isClient = String(booking.client._id) === String(req.user.id);
		const isProvider = req.user.role === 'provider' && String(booking.provider._id) === String(req.user.id);

		if (!isClient && !isProvider && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		return res.json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const getBookingStats = async (req, res) => {
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
