const Review = require('../models/Review.js');
const Booking = require('../models/Booking.js');
const Provider = require('../models/Provider.js');


const createReview = async (req, res) => {
	try {
		const { bookingId, rating, comment } = req.body;
		const userId = req.user.id;

		const booking = await Booking.findById(bookingId)
			.populate('provider client');
		if (!booking) return res.status(404).json({ message: 'Booking not found' });

		// Check if user is the client of this booking
		if (String(booking.client._id) !== String(userId)) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		// Check if booking is completed
		if (booking.status !== 'completed') {
			return res.status(400).json({ message: 'Can only review completed bookings' });
		}

		// Check if review already exists
		const existingReview = await Review.findOne({ booking: bookingId });
		if (existingReview) {
			return res.status(400).json({ message: 'Review already exists for this booking' });
		}

		const review = await Review.create({
			booking: bookingId,
			client: userId,
			provider: booking.provider._id,
			rating,
			comment,
			isVerified: true
		});

		// Update provider rating and review count
		await updateProviderRating(booking.provider._id);

		await review.populate([
			{ path: 'client', select: 'firstName lastName profileImage' },
			{ path: 'booking', select: 'serviceCategory eventType dateStart' }
		]);

		return res.status(201).json({ review });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const getProviderReviews = async (req, res) => {
	try {
		const { providerId } = req.params;
		const { page = 1, limit = 20 } = req.query;

		const provider = await Provider.findById(providerId);
		if (!provider) return res.status(404).json({ message: 'Provider not found' });

		const reviews = await Review.find({ provider: providerId })
			.populate([
				{ path: 'client', select: 'firstName lastName profileImage' },
				{ path: 'booking', select: 'serviceCategory eventType dateStart' }
			])
			.sort({ createdAt: -1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));

		const total = await Review.countDocuments({ provider: providerId });

		// Calculate average rating
		const allReviews = await Review.find({ provider: providerId });
		const averageRating = allReviews.length > 0
			? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
			: 0;

		return res.json({
			reviews,
			averageRating: Math.round(averageRating * 10) / 10,
			totalReviews: allReviews.length,
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

const getMyReviews = async (req, res) => {
	try {
		const userId = req.user.id;
		const { page = 1, limit = 20 } = req.query;

		let filter = {};
		if (req.user.role === 'client') {
			filter.client = userId;
		} else if (req.user.role === 'provider') {
			const provider = await Provider.findOne({ user: userId });
			if (!provider) return res.json({ reviews: [], pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 } });
			filter.provider = provider._id;
		} else {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const reviews = await Review.find(filter)
			.populate([
				{ path: 'client', select: 'firstName lastName profileImage' },
				{ path: 'provider', populate: { path: 'user', select: 'firstName lastName' } },
				{ path: 'booking', select: 'serviceCategory eventType dateStart' }
			])
			.sort({ createdAt: -1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));

		const total = await Review.countDocuments(filter);

		return res.json({
			reviews,
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

const updateReview = async (req, res) => {
	try {
		const { id } = req.params;
		const { rating, comment } = req.body;
		const userId = req.user.id;

		const review = await Review.findById(id);
		if (!review) return res.status(404).json({ message: 'Review not found' });

		// Check if user is the author of the review
		if (String(review.client._id) !== String(userId) && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		review.rating = rating || review.rating;
		review.comment = comment || review.comment;

		await review.save();

		// Update provider rating
		await updateProviderRating(review.provider);

		await review.populate([
			{ path: 'client', select: 'firstName lastName profileImage' },
			{ path: 'booking', select: 'serviceCategory eventType dateStart' }
		]);

		return res.json({ review });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

const deleteReview = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const review = await Review.findById(id);
		if (!review) return res.status(404).json({ message: 'Review not found' });

		// Check if user is the author of the review or admin
		if (String(review.client._id) !== String(userId) && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		await Review.findByIdAndDelete(id);

		// Update provider rating
		await updateProviderRating(review.provider);

		return res.json({ message: 'Review deleted successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Helper function to update provider rating
async function updateProviderRating(providerId) {
	try {
		const reviews = await Review.find({ provider: providerId });
		const totalReviews = reviews.length;
		const averageRating = totalReviews > 0
			? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
			: 0;

		await Provider.findByIdAndUpdate(providerId, {
			rating: Math.round(averageRating * 10) / 10,
			reviews: totalReviews
		});
	} catch (err) {
		console.error('Error updating provider rating:', err);
	}
}



module.exports = {
	createReview,
	getProviderReviews,
	getMyReviews,
	updateReview,
    deleteReview

}