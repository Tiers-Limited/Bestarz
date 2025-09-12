import Provider from '../models/Provider.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

// Get provider dashboard stats
export const getProviderDashboard = async (req, res) => {
	try {
		const userId = req.user.id;
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		// Get current date ranges
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
		
		// Booking stats
		const totalBookings = await Booking.countDocuments({ provider: provider._id });
		const pendingBookings = await Booking.countDocuments({ 
			provider: provider._id, 
			status: 'pending' 
		});
		const confirmedBookings = await Booking.countDocuments({ 
			provider: provider._id, 
			status: 'confirmed' 
		});
		const thisMonthBookings = await Booking.countDocuments({
			provider: provider._id,
			createdAt: { $gte: startOfMonth }
		});
		
		// Revenue stats
		const completedPayments = await Payment.find({ 
			provider: provider._id, 
			status: 'completed' 
		});
		const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
		const thisMonthRevenue = completedPayments
			.filter(payment => payment.processedAt >= startOfMonth)
			.reduce((sum, payment) => sum + payment.amount, 0);
		
		// Recent bookings
		const recentBookings = await Booking.find({ provider: provider._id })
			.populate('client', 'firstName lastName email phone')
			.sort({ createdAt: -1 })
			.limit(5);
		
		// Recent inquiries (pending bookings)
		const recentInquiries = await Booking.find({ 
			provider: provider._id, 
			status: 'pending' 
		})
			.populate('client', 'firstName lastName email phone')
			.sort({ createdAt: -1 })
			.limit(5);
		
		return res.json({
			stats: {
				totalBookings,
				pendingBookings,
				confirmedBookings,
				thisMonthBookings,
				totalRevenue,
				thisMonthRevenue,
				averageRating: provider.rating || 0,
				totalReviews: provider.reviews || 0
			},
			recentBookings,
			recentInquiries
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get provider profile
export const getMyProviderProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const provider = await Provider.findOne({ user: userId })
			.populate('user', 'firstName lastName profileImage email phone');
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		return res.json({ provider });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Update provider profile
export const updateProviderProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const update = req.body;
		
		// Generate slug from business name if changed
		if (update.businessName && !update.slug) {
			update.slug = update.businessName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
		
		const provider = await Provider.findOneAndUpdate(
			{ user: userId },
			{ $set: update },
			{ new: true, upsert: true }
		).populate('user', 'firstName lastName profileImage email phone');
		
		return res.json({ provider });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get provider bookings with filtering
export const getProviderBookings = async (req, res) => {
	try {
		const userId = req.user.id;
		const { status, page = 1, limit = 20, startDate, endDate } = req.query;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		let filter = { provider: provider._id };
		if (status) filter.status = status;
		if (startDate || endDate) {
			filter.dateStart = {};
			if (startDate) filter.dateStart.$gte = new Date(startDate);
			if (endDate) filter.dateStart.$lte = new Date(endDate);
		}
		
		const bookings = await Booking.find(filter)
			.populate('client', 'firstName lastName email phone profileImage')
			.sort({ dateStart: 1 })
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
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, notes, amount } = req.body;
		const userId = req.user.id;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		const booking = await Booking.findOne({ _id: id, provider: provider._id });
		if (!booking) return res.status(404).json({ message: 'Booking not found' });
		
		booking.status = status;
		if (notes) booking.notes = notes;
		if (amount) booking.amount = amount;
		booking.updatedAt = new Date();
		
		await booking.save();
		
		await booking.populate('client', 'firstName lastName email phone profileImage');
		
		return res.json({ booking });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Get provider customers
export const getProviderCustomers = async (req, res) => {
	try {
		const userId = req.user.id;
		const { page = 1, limit = 20, search } = req.query;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		// Get unique customers who have bookings with this provider
		const bookings = await Booking.find({ provider: provider._id })
			.populate('client', 'firstName lastName email phone profileImage')
			.sort({ createdAt: -1 });
		
		// Group bookings by customer
		const customerMap = new Map();
		bookings.forEach(booking => {
			const customerId = booking.client._id.toString();
			if (!customerMap.has(customerId)) {
				customerMap.set(customerId, {
					...booking.client.toObject(),
					totalBookings: 0,
					totalSpent: 0,
					lastBooking: null,
					bookingHistory: [],
					status: 'active'
				});
			}
			
			const customer = customerMap.get(customerId);
			customer.totalBookings += 1;
			if (booking.amount) customer.totalSpent += booking.amount;
			if (!customer.lastBooking || booking.dateStart > customer.lastBooking) {
				customer.lastBooking = booking.dateStart;
			}
			customer.bookingHistory.push(booking);
		});
		
		let customers = Array.from(customerMap.values());
		
		// Apply search filter
		if (search) {
			const searchRegex = new RegExp(search, 'i');
			customers = customers.filter(customer => 
				searchRegex.test(customer.firstName) ||
				searchRegex.test(customer.lastName) ||
				searchRegex.test(customer.email)
			);
		}
		
		// Pagination
		const total = customers.length;
		const startIndex = (Number(page) - 1) * Number(limit);
		const paginatedCustomers = customers.slice(startIndex, startIndex + Number(limit));
		
		return res.json({
			customers: paginatedCustomers,
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

// Get provider earnings
export const getProviderEarnings = async (req, res) => {
	try {
		const userId = req.user.id;
		const { page = 1, limit = 20, status } = req.query;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		let filter = { provider: provider._id };
		if (status) filter.status = status;
		
		const payments = await Payment.find(filter)
			.populate([
				{ path: 'booking', select: 'serviceCategory eventType dateStart location' },
				{ path: 'client', select: 'firstName lastName' }
			])
			.sort({ createdAt: -1 })
			.skip((Number(page) - 1) * Number(limit))
			.limit(Number(limit));
		
		const total = await Payment.countDocuments(filter);
		
		// Calculate stats
		const allPayments = await Payment.find({ provider: provider._id, status: 'completed' });
		const totalEarnings = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
		
		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);
		
		const thisMonthEarnings = allPayments
			.filter(payment => payment.processedAt && payment.processedAt >= thisMonth)
			.reduce((sum, payment) => sum + payment.amount, 0);
		
		const pendingPayments = await Payment.find({ provider: provider._id, status: 'pending' });
		const upcomingPayout = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
		
		return res.json({
			payments,
			stats: {
				totalEarnings,
				thisMonthEarnings,
				upcomingPayout
			},
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


// Rate card management
export const getProviderRateCards = async (req, res) => {
	try {
		const userId = req.user.id;
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		return res.json({ rateCards: provider.rateCards || [] });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const createRateCard = async (req, res) => {
	try {
		const userId = req.user.id;
		const { service, basePrice, duration, includes, addOns } = req.body;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		const rateCard = {
			id: Date.now().toString(),
			service,
			basePrice,
			duration,
			includes: includes || [],
			addOns: addOns || []
		};
		
		if (!provider.rateCards) provider.rateCards = [];
		provider.rateCards.push(rateCard);
		
		await provider.save();
		
		return res.status(201).json({ rateCard });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const updateRateCard = async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const update = req.body;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		const rateCardIndex = provider.rateCards?.findIndex(rc => rc.id === id);
		if (rateCardIndex === -1) return res.status(404).json({ message: 'Rate card not found' });
		
		provider.rateCards[rateCardIndex] = { ...provider.rateCards[rateCardIndex], ...update };
		await provider.save();
		
		return res.json({ rateCard: provider.rateCards[rateCardIndex] });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const deleteRateCard = async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		if (!provider.rateCards) return res.status(404).json({ message: 'Rate card not found' });
		
		provider.rateCards = provider.rateCards.filter(rc => rc.id !== id);
		await provider.save();
		
		return res.json({ message: 'Rate card deleted successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

// Provider settings
export const getProviderSettings = async (req, res) => {
	try {
		const userId = req.user.id;
		const provider = await Provider.findOne({ user: userId })
			.populate('user', 'firstName lastName email phone');
		
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		return res.json({
			settings: {
				businessName: provider.businessName,
				email: provider.user.email,
				phone: provider.user.phone,
				notifications: {
					bookingAlerts: provider.settings?.bookingAlerts ?? true
				},

			}
		});
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};

export const updateProviderSettings = async (req, res) => {
	try {
		const userId = req.user.id;
		const { businessName, phone, notifications } = req.body;
		
		const provider = await Provider.findOne({ user: userId });
		if (!provider) return res.status(404).json({ message: 'Provider profile not found' });
		
		// Update provider settings
		if (businessName) provider.businessName = businessName;
	
		
		provider.settings = {
			...provider.settings,
			bookingAlerts: notifications?.bookingAlerts ?? provider.settings?.bookingAlerts ?? true,

		};
		
		await provider.save();
		
		// Update user phone if provided
		if (phone) {
			await User.findByIdAndUpdate(userId, { phone });
		}
		
		return res.json({ message: 'Settings updated successfully' });
	} catch (err) {
		return res.status(500).json({ message: err.message });
	}
};




export const getProviderBySlug = async (req, res) => {
	try {
	  const { slug } = req.params;
	  
	  const provider = await Provider.findOne({ slug, isActive: true })
		.populate('user', 'firstName lastName profileImage')
		.select('-user.passwordHash -user.email -user.phone'); // Don't expose private info
	  
	  if (!provider) {
		return res.status(404).json({ message: 'Provider not found' });
	  }
	  
	  // Return public profile data
	  return res.json({
		provider: {
		  id: provider._id,
		  slug: provider.slug,
		  businessName: provider.businessName,
		  category: provider.category,
		  description: provider.description,
		  services: provider.services,
		  basePrice: provider.basePrice,
		  location: provider.location,
		  rating: provider.rating,
		  reviews: provider.reviews,
		  portfolio: provider.portfolio,
		  rateCards: provider.rateCards,
		  availability: provider.availability,
		  user: {
			firstName: provider.user.firstName,
			lastName: provider.user.lastName,
			profileImage: provider.user.profileImage
		  }
		}
	  });
	} catch (err) {
	  return res.status(500).json({ message: err.message });
	}
  };