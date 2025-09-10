import Booking from '../models/Booking.js';
import Provider from '../models/Provider.js';

export const createBooking = async (req, res) => {
	try {
		const clientId = req.user.id;
		const { providerId, serviceCategory, eventType, location, guests, dateStart, dateEnd, budgetMin, budgetMax, description } = req.body;
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
			budgetMin,
			budgetMax,
			description
		});
		return res.status(201).json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const listMyBookings = async (req, res) => {
	try {
		const role = req.user.role;
		if (role === 'client') {
			const bookings = await Booking.find({ client: req.user.id }).populate('provider');
			return res.json({ bookings });
		}
		if (role === 'provider') {
			const provider = await Provider.findOne({ user: req.user.id });
			if (!provider) return res.json({ bookings: [] });
			const bookings = await Booking.find({ provider: provider._id });
			return res.json({ bookings });
		}
		return res.status(403).json({ message: 'Forbidden' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const updateBookingStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		const booking = await Booking.findById(id);
		if (!booking) return res.status(404).json({ message: 'Booking not found' });
		// Only the provider owning the booking can update status
		if (req.user.role !== 'provider') return res.status(403).json({ message: 'Forbidden' });
		const provider = await Provider.findOne({ user: req.user.id });
		if (!provider || String(provider._id) !== String(booking.provider)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		booking.status = status;
		await booking.save();
		return res.json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};
